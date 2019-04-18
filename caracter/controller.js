'use strict'

const httpErrors = require('http-errors');
const { Caracter, Group } = require('./model');
const { formatSuccess } = require('../local-util');

module.exports = {
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
};

async function getCaracters(req, res, next) {
    try {
        const parsedQuery = parseQuery(req.query);
        const pipeline = buildPipeline(parsedQuery);
        const result = await Caracter.aggregate(pipeline).exec();
        const payload = (!Array.isArray(result) || result.length === 0)
            ? emptyPayload(parsedQuery)
            : result[0];

        res.json(formatSuccess(payload));
    } catch (error) {
        next(error);
    }
}

async function saveCaracter(req, res, next) {
    try {
        const car = new Caracter({
            name: req.body.name,
            ca: req.body.ca,
            maxHp: req.body.maxHp,
            hp: req.body.hp,
            dext_mod: req.body.dext_mod,
            strength_mod: req.body.strength_mod,
        });
        await car.save();
        res.json(formatSuccess(car));
    } catch (error) {
        next(error);
    }
}

async function deleteCaracter(req, res, next) {
    try {
        const id = req.params.id;
        const result = await Caracter.deleteOne({ _id: id }).exec();
        if (result.n === 0) {
            throw new httpErrors.NotFound('Caracter not found');
        }
        await Group.updateMany({
            members: id
        }, {
                $pull: {
                    members: id
                }
            });

        res.json(formatSuccess(`Caracter id : ${id} successfully removed`));
    } catch (error) {
        next(error);
    }
}

async function getOneCaracter(req, res, next) {
    try {
        const id = req.params.id;
        const car = await Caracter.findById(id).exec();
        res.json(formatSuccess(car));
    } catch (error) {
        next(error);
    }
}

async function updateCaracter(req, res, next) {
    try {
        const id = req.params.id;
        const car = await Caracter.findOneAndUpdate({
            _id: id,
        }, {
                name: req.body.name,
                ca: req.body.ca,
                maxHp: req.body.maxHp,
                hp: req.body.hp,
                dext_mod: req.body.dext_mod,
                strength_mod: req.body.strength_mod,
            }, {
                new: true,
            }).exec();
        res.json(formatSuccess(car));
    } catch (error) {
        next(error);
    }
}

async function getGroups(req, res, next) {
    try {
        const parsedQuery = parseQuery(req.query);
        const pipeline = buildPipeline(parsedQuery);
        const result = await Group.aggregate(pipeline).exec();

        const payload = (!Array.isArray(result) || result.length === 0)
            ? emptyPayload(parsedQuery)
            : result[0];

        await Group.populate(payload.page, 'members');

        res.json(formatSuccess(payload));
    } catch (error) {
        next(error);
    }
}

async function saveGroup(req, res, next) {
    try {
        let group = await new Group({
            name: req.body.name,
            members: req.body.members,
        }).populate('members').execPopulate();
        group = await group.save();
        res.json(formatSuccess(group));
    } catch (error) {
        next(error);
    }
}

async function deleteGroup(req, res, next) {
    try {
        const id = req.params.id;
        const result = await Group.deleteOne({ _id: id }).exec();
        if (result.n === 0) {
            throw new httpErrors.NotFound('Caracter not found');
        }
        res.json(formatSuccess(`Caracter id : ${id} successfully removed`));
    } catch (error) {
        next(error);
    }
}

async function getOneGroup(req, res, next) {
    try {
        const id = req.params.id;
        const group = await Group.findById(id).populate('members').exec();
        res.json(formatSuccess(group));
    } catch (error) {
        next(error);
    }
}

async function updateGroup(req, res, next) {
    try {
        const id = req.params.id
        const group = await Group.findByIdAndUpdate(id,
            {
                name: req.body.name,
                members: req.body.members,
            }, {
                new: true,
            }).populate('members').exec();
            res.json(formatSuccess(group));
        } catch (error) {
        next(error);
    }
}

function buildPipeline(parsedQuery) {
    const {
        filter,
        sortBy,
        sortOrder,
        pageOffset,
        pageSize,
    } = parsedQuery;

    const pipeline = [];
    if (filter) {
        pipeline.push({
            $match: { name: buildRegexp(filter) }
        });
    }
    if (sortBy && sortOrder) {
        pipeline.push({
            $sort: { [sortBy]: sortOrder }
        });
    }
    const datapipeline = [];
    datapipeline.push({ $skip: pageOffset });
    if (pageSize) {
        datapipeline.push({ $limit: pageSize });
    }
    pipeline.push(
        {
            $facet: {
                page: datapipeline,
                meta: [{ $count: 'totalCount' }],
            }
        }, {
            $unwind: '$meta',
        }, {
            $project: {
                _id: 0,
                page: 1,
                'meta.filter': { $literal: (filter ? filter : '') },
                'meta.totalCount': 1,
                'meta.pageOffset': { $literal: pageOffset },
                'meta.pageSize': { $literal: pageSize },
                'meta.dataSize': { $size: '$page' },
                'meta.sortBy': { $literal: sortBy },
                'meta.sortOrder': {
                    $literal: ((sortOrder === 1)
                        ? 'asc'
                        : ((sortOrder === -1)
                            ? 'desc'
                            : ''
                        )
                    )
                },
            }
        }
    );
    return pipeline;
}

function emptyPayload(parsedQuery) {
    const {
        filter,
        sortBy,
        sortOrder,
        pageOffset,
        pageSize,
    } = parsedQuery;
    return {
        page: [],
        meta: {
            filter: (filter ? filter : ''),
            totalCount: 0,
            pageOffset,
            pageSize,
            dataSize: 0,
            sortBy,
            sortOrder: ((sortOrder === 1)
                ? 'asc'
                : ((sortOrder === -1)
                    ? 'desc'
                    : ''
                )
            ),
        }
    };
}

function parseQuery(query) {
    const filter = query.filter ? query.filter : null;
    const sortBy = query.sortBy || '';
    const sortOrder = (query.sortOrder === 'asc')
        ? 1
        : (query.sortOrder === 'desc')
            ? -1
            : 0;
    const pageOffset = Number(query.pageOffset) || 0;
    const pageSize = Number(query.pageSize) || 0;
    return {
        filter,
        sortBy,
        sortOrder,
        pageOffset,
        pageSize,
    };
}

function buildRegexp(filter) {
    let regExp = null;
    if (filter) {
        try {
            regExp = new RegExp(filter, 'i');
        } catch (error) {
            const escaped = filter.replace(/[-[\]{}()*+!<=:?.\/\\^$|#\s,]/g, '\\$&');
            regExp = new RegExp(escaped, 'i');
        }
    }
    return regExp;
}