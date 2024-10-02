const express = require('express');
const pash = require('path');
const fs = require('fs').promises;

const app = express();

const clientPath = path.join(__dirname, "..", "client/src");
const usersPath = path.join(__dirname, "data", "users.json");
const recipesPath = path.join(__dirname, "data", "recipes.json");

app.use(express.static(clientPath));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: clientPath });
});
 
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
        
     }
})