'use strict'

const { db } = require('./caracter');
const { Group, Caracter } = require('./caracter');

main();

async function main() {
    try {
        let cnx;
        try {
            cnx = await db;

            for (const groupPagePromise of groupPages()) {
                for (const group of await groupPagePromise) {
                    console.log(`scanning group ${group.name}`);
                    let errors = 0;
                    for (const member of group.members) {
                        const count = await Caracter.countDocuments({ _id: member }).exec();
                        if (count === 0) {
                            console.log(`error member : ${member} from group ${id} not found in database`);
                            errors++;
                        }
                    }
                    if (!errors) {
                        console.log('   ... ok');
                    }
                }
            }
        } finally {
            if (cnx) {
                cnx.close();
            }
        }
    } catch (error) {
        console.error(error);
    }
}

function* groupPages(pageSize = 10) {
    let pageOffset = 0;
    let nbRead;
    do {
        yield Group.find()
            .skip(pageOffset)
            .limit(pageSize)
            .exec()
            .then((ids) => {
                nbRead = ids.length;
                return ids;
            });
        pageOffset += pageSize;
        // console.log(`nb = ${nbRead} / offset = ${pageOffset} / size = ${pageSize}`);
    } while (nbRead === pageSize);
}