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