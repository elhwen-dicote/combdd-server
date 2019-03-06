'use strict'

const mongoose = require('mongoose');
const { mongodb } = require('./config');

const db = mongoose.createConnection(mongodb.url, mongodb.options);

db
    .then(() => {
        console.log(`connection ${mongodb.url} successfully opened`);
    })
    .catch((error) => {
        console.error(`error opening database connection to ${mongodb.url}`);
        console.error(`${error}`);
        process.exit();
    });

module.exports = { db };
