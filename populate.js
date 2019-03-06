'use strict'

const {db} = require('./caracter');

main();

async function main() {
    try {
        let cnx;
        try {
            cnx = await db;
            await cnx.dropDatabase();
        } finally {
            if (cnx) {
                cnx.close();
            }
        }
    } catch (error) {
        console.error(error);
    }
}