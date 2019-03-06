'use strict'

const { URL } = require('url');

const DEFAULT_NAME = 'combatDD';

const url = buildMongoUrl();

module.exports = {
    mongodb: {
        url: (url ? url.href : null),
        options: {
            useNewUrlParser: true,
            useFindAndModify: false,
            useCreateIndex: true,
            autoIndex: true,
        }
    }
}

function buildMongoUrl() {
    let url = null;
    const mongoUrlString = buildFromFullUrl() || buildFromHostPortName();
    try {
        url = new URL(mongoUrlString);
    } catch (error) {
        console.error(`error building mongodb url : [${error.code}] ${error.message}`);
    }
    return url;
}

function buildFromFullUrl() {
    return process.env.MONGODB_URL;
}

function buildFromHostPortName() {
    const host = process.env.MONGODB_HOST || 'localhost';
    const port = process.env.MONGODB_PORT || 27017;
    const name = process.env.MONGODB_NAME || DEFAULT_NAME;
    return `mongodb://${host}:${port}/${name}`;
}