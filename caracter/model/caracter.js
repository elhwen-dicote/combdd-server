'use strict'

const { Schema } = require('mongoose');
const { db } = require('./connection');

const caracterSchema = new Schema({
    name: { type: String, unique: true },
    ca: { type: Number },
    maxHp: { type: Number },
    hp: { type: Number },
    dext_mod: { type: Number },
    strength_mod: { type: Number },
});

const Caracter = db.model('Caracter', caracterSchema);
Caracter.on('index', async (error) => {
    if (error) {
        console.log('error building indexes: %o', error);
    }
});

module.exports = {
    Caracter,
};

