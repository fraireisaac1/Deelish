const express = require('express');
const path = require('path');
const fs = require('fs').promises;

const app = express();


const clientPath = path.join(__dirname, "..", "client/src");
const usersPath = path.join(__dirname, "data", "users.json");
const recipesPath = path.join(__dirname, "data", "recipes.json");
const serverPublic = path.join(__dirname, 'public');

app.use(express.static(clientPath));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: clientPath });
});

app.get('/form', (req, res) => {
    res.sendFile('pages/form.html', { root: serverPublic });
})

app.get('/deelish', (req, res) => { 
    res.sendFile('pages/deelish.html', { root: serverPublic });
});

app.get('/index', (req, res) => {
    res.sendFile('pages/form.html', { root: serverPublic });
})

app.get('/users', async (req, res) => {
    try {
        const data = await fs.readFile(usersPath, 'utf8');

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
            const data = await fs.readFile(usersPath, 'utf8');
            users = JSON.parse(data);
        } catch (error) {
            console.error('Error reading user data: ', error);
            users = [];
        }

        let user = users.find(u => u.name === name && u.email === email && u.password === password);
        if (user) {
            // something doesn't add up
            console.log(user)
        } else {
            user = { name, email, password };
            users.push(user);
        }

        await fs.writeFile(usersPath, JSON.stringify(users, null, 2));
        res.redirect('/form');
    } catch (error) {
        console.error('Error processing form: ', error);
        res.status(500).send('An error occurred while processing your submission.');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

app.put('/update-user/:currentName/:currentEmail/:currentPassword', async (req, res) => {
    try {
        const { currentName, currentEmail, currentPassword } = req.params;
        const { newName, newEmail, newPassword } = req.body;
        console.log('Current user:', { currentName, currentEmail });
        console.log('New user data:', { newName, newEmail, newPassword });
        const data = await fs.readFile(usersPath, 'utf8');
        if (data) {
            let users = JSON.parse(data);
            const userIndex = users.findIndex(user => user.name === currentName && user.email === currentEmail && user.password === currentPassword);
            if (userIndex === -1) {
                return res.status(404).json({ message: "User not found" });
            }
            users[userIndex] = { ...users[userIndex], name: newName, email: newEmail, password: newPassword };
            console.log(users);
            await fs.writeFile(usersPath, JSON.stringify(users, null, 2));
            res.status(200).json({ message: `You sent ${newName}, ${newEmail} and ${newPassword}` });
        }
    }
    catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send('An error occured while trying to update the user account')
    }
});

app.delete('/user/:name/:email', async (req, res) => {
    try {
        const { name, email } = req.params;
        let users = [];
        try {
            const data = await fs.readFile(usersPath, 'utf8');
            users = JSON.parse(data);
        } catch (error) {
            return res.status(404).send(`File data can't be found`);
        }
        const userIndex = users.findIndex(user => user.name === name && user.email === email);
        if (userIndex === -1) {
            return res.status(404).send('User not found');
        }
        users.splice(userIndex, 1);
        console.log(userIndex);
        console.log(users);
        try {
            await fs.writeFile(usersPath, JSON.stringify(users, null, 2));
        } catch (error) {
            res.status(500).send("There was a problem!!!");
        }
        return res.send('Nice you deleted user');
    } catch (error) {
        console.error("there was an error");
    }
});

app.get('/recipes', async (req, res) => {
    try {
        const data = await fs.readFile(recipesPath, 'uft8');
        
        const recipes = JSON.parse(data);
        if (!recipes) {
            throw new Error("Hey that's not a recipe!");
        }
        res.status(200).json(recipes);
    } catch (error) {
        console.error("Problem getting recipes" + error.message);
        res.status(500).json({ error: "Problem reading users" });
    }
});

app.post('/submit-recipe', async (req, res) => {
    try {
        const { food, ingredients, author, instructions } = req.body;
        let recipes = [];
        try {
            const data = await fs.readFile(recipesPath, 'utf8');
            recipes = JSON.parse(data);
        } catch (error) {
            console.error('Error reading recipe data: ', error);
            recipes = [];
        }

        let recipe = recipes.find(u => u.food === food && u.ingredients === ingredients && u.author === author && u.instructions === instructions);
        if (recipe) {
            // something doesn't add up
            console.log(recipe)
        } else {
            recipe = { food, ingredients, author, instructions };
            recipes.push(recipe);
        }

        await fs.writeFile(recipesPath, JSON.stringify(recipes, null, 2));
        res.redirect('/deelish');
    } catch (error) {
        console.error('Error processing form: ', error);
        res.status(500).send('An error occurred while processing your submission.');
    }
});

