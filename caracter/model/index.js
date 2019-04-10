'use strict'

const db = require('./connection');
const caracter = require('./caracter');
const group = require('./group');

module.exports = {
    ...db,
    ...caracter,
    ...group,
};