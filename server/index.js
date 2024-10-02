const express = require('express');
const pash = require('path');
const fs = require('fs').promises;

const app = express();

const serverPublic = path.join(__dirname, 'public');

const clientPath = path.join(__dirname, "..", "client/src");
const dataPath = path.join(__dirname, 'data', 'users.json', 'recipes.json');

app.use(express.static(clientPath));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: clientPath });
});

app.get('/form', (req, res) => {
    res.sendFile('pages/form.html', { root: serverPublic });
})

app.get('/index', (req, res) => {
    res.sendFile('pages/form.html', { root: serverPublic });
})

app.get('/users', async (req, res) => {
    try {
        const data = await fs.readFile(dataPath, 'utf8');

        const users = JSON.parse(data);
        if (!users) {
            throw new Error("Hey that's not a user!");
        }
        res.status(200).json(users);
    } catch (error) {
        console.error("Problem getting users" + error.message);
        res.status(500).json({ error: "Problem reading users" });
    }
});

app.post('/submit-form', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        let users = [];
        try {
            const data = await fs.readFile(dataPath, 'utf8');
            users = JSON.parse(data);
        } catch (error) {
            console.error('Error reading the user data:', error);
            users = [];
        }

        let user = users.find(u => u.name === name && u.email == email && u.password === password);

        await fs.writeFile(dataPath, JSON.stringify(users, null, 2));
        res.redirect('form');
    } catch (error) {
        console.error('Error processing form:', error);
        res.status(500).send('Oops, an error occured while processing your submission.');
    }
})

app.put('/update user/:currentName/:currentEmail/:currentPassword', async (req, res) => {
    try {
        const { currentName, currentEmail, currentPassword } = req.params;
        const { newName, newEmail, newPassword } = req.body;
        console.log('Current user:', { currentName, currentEmail });
        console.log('New user data:', { newName, newEmail, newPassword });
        const data = await fs.readFile(dataPath, 'utf8');
        if (data) {
            let users = JSON.parse(data);
            const userIndex = users.findIndex(user => user.name === currentName && user.email === currentEmail && user.password === currentPassword);
            if (userIndex === -1) {
                return res.status(404).json({ message: "User not found" });
            }
            users[userIndex] = { ...users[userIndex], name: newName, email: newEmail };
            console.log(users);
            await fs.writeFile(dataPath, JSON.stringify(users, null, 2));
            res.status(200).json({ message: `You sent ${newName}, ${newEmail} and ${newPassword}` });
        }
    }
    catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send('An error occured while trying to update the user account')
    }
});

app.delete('/user/:name/:email/:password', async (req, res) => {
    try {
        const { name, email, password } = req.params;
        let users = [];
        try {
            const data = await fs.readFile(dataPath, 'utf8');
            users.JSON(parse(data));
        } catch (error) {
            return res.status(404).send(`File data can't be found`);
        }
        const userIndex = users.findIndex(user => user.name === name && user.email === email && user.password === password);
        if (userIndex === -1) {
            return res.status(404).json({ message: 'User was not found :(' });
        }
        users.splice(userIndex, 1);
        console.log(userIndex);
        console.log(users);
        try {
            await fs.writeFile(dataPath, JSON.stringify(users, null, 2));
        } catch (error) {
            res.status(500).send("There was a problem!!!");
        }
        return res.send('Nice you deleted user');
    } catch (error) {
        console.error("there was an error");
    }
})