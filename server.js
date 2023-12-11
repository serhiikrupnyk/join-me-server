const express = require('express');
const mysql = require('mysql2');
const dbConfig = require('./config/db');

const connection = mysql.createConnection(dbConfig);

connection.connect(error => {
    if (error) {
        console.error('Error connecting to the database:', error);
    } else {
        console.log('Connected to the database!');
    }
});

const app = express();
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});