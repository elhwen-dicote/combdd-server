'use strict'

const express = require('express');
const {
    getCaracters,
    saveCaracter,
    deleteCaracter,
    getOneCaracter,
    updateCaracter,
    getGroups,
    saveGroup,
    deleteGroup,
    getOneGroup,
    updateGroup,
} = require('./controller');

const router = express.Router();

router.get('/caracter', getCaracters);

router.post('/caracter', saveCaracter);

router.put('/caracter/:id', updateCaracter);

router.delete('/caracter/:id', deleteCaracter);

router.get('/caracter/:id', getOneCaracter);

router.get('/group', getGroups);

router.post('/group', saveGroup);

router.put('/group/:id', updateGroup);

router.delete('/group/:id', deleteGroup);

router.get('/group/:id', getOneGroup);

module.exports = {
    router,
};