const express = require('express');
const pash = require('path');
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
});
app.post('/submit-form', async (req, res) => { 
    try {
        const { name, email, password } = req.body;
        let users = [];
        try {
            const data = await fs.readFile(clientPath, 'utf8');
            users = JSON.parse(data);
        } catch (error) {
            console.error('Error reading user data: ', error);
            users = [];
        }

        let user = users.find(u => u.name === name && user.email === email && user.password === password);
        if (user) {
            // something doesn't add up
        } else {
            user = { name, email, password };
            users.push(user);
        }

        await fs.writeFile(clientPath, JSON.stringify(users, null, 2));
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