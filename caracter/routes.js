'use strict'

const express = require('express');
const {
    getCaracters,
    saveCaracter,
    deleteCaracter,
    getOneCaracter,
    updateCaracter,
} = require('./controller');

const router = express.Router();

router.get('', getCaracters);

router.post('', saveCaracter);

router.put('/:id', updateCaracter);

router.delete('/:id', deleteCaracter);

router.get('/:id', getOneCaracter);

module.exports = {
    router,
};