var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const httpErrors = require('http-errors');
const { formatError } = require('./local-util');

const { router: caracterRouter } = require('./caracter');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
    '/combdd/',
    express.static(path.join(__dirname, 'dist', 'combdd')),
    (req, res, next) => {
        res.sendFile(path.join(__dirname, 'dist', 'combdd', 'index.html'));
    });

app.use('/api/caracter', caracterRouter);

app.use(function (req, res, next) {
    next(httpErrors.NotFound(`resource not found for url ${req.originalUrl}`));
});

app.use(function (err, req, res, next) {
    console.error('error handler : ', err.message);
    res.status(err.status || 500).json(formatError(err));
});

module.exports = app;
