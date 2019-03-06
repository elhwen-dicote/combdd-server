'use strict'

const model = require('./model');
const routes = require('./routes');

module.exports = {
    ...model,
    ...routes,
};