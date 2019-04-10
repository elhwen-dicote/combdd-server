'use strict'

const { Schema } = require('mongoose');
const { db } = require('./connection');

const groupSchema = new Schema({
    name: { type: String, unique: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'Caracter' }],
});

const Group = db.model('Group', groupSchema);
Group.on('index', (error) => {
    if (error) {
        console.log('error building indexes: %o', error);
    }
});

module.exports = {
    Group,
};