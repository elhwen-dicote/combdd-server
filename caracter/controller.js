'use strict'

const httpErrors = require('http-errors');
const { Caracter } = require('./model');
const { formatSuccess } = require('../local-util');

module.exports = {
    saveCaracter,
    getCaracters,
    deleteCaracter,
    getOneCaracter,
    updateCaracter,
};

async function getCaracters(req, res, next) {
    try {
        const filter = req.query.filter ? new RegExp(req.query.filter, 'i') : null;
        const sortBy = req.query.sortBy || '';
        const sortOrder = (req.query.sortOrder === 'desc') ? -1 : 1;
        const pageOffset = Number(req.query.pageOffset) || 0;
        const pageSize = Number(req.query.pageSize) || 0;

        const pipeline = [];
        if (filter) {
            pipeline.push({
                $match: { name: filter }
            });
        }
        if (sortBy) {
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
                    'meta.filter': { $literal: (filter ? filter.source : '') },
                    'meta.totalCount': 1,
                    'meta.pageOffset': { $literal: pageOffset },
                    'meta.pageSize': { $literal: pageSize },
                    'meta.dataSize': { $size: '$page' },
                    'meta.sortBy': { $literal: sortBy },
                    'meta.sortOrder': { $literal: ((sortOrder === 1) ? 'asc' : 'desc') },
                }
            }
        );

        const result = await Caracter.aggregate(pipeline).exec();
        const payload = (!Array.isArray(result) || result.length === 0)
            ? {
                page: [],
                meta: {
                    filter: (filter ? filter.source : ''),
                    totalCount: 0,
                    pageOffset,
                    pageSize,
                    dataSize: 0,
                    sortBy,
                    sortOrder: ((sortOrder === 1) ? 'asc' : 'desc'),
                }
            }
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

async function deleteCaracter(req,res,next) {
    try {
        const id = req.params.id;
        const result = await Caracter.deleteOne({ _id: id }).exec();
        if (result.n === 0) {
            throw new httpErrors.NotFound('Caracter not found');
        }
        res.json(formatSuccess(`Caracter id : ${id} successfully removed`));
    } catch (error) {
        next(error);
    }
}

async function getOneCaracter(req,res,next) {
    try {
        const id = req.params.id;
        const car = await Caracter.findById(id).exec();
        res.json(formatSuccess(car));
    } catch (error) {
        next(error);
    }
}

async function updateCaracter(req,res,next) {
    try {
        const id = req.params.id;
        const car = await Caracter.findOneAndUpdate({
            _id : id,
        },{
            name: req.body.name,
            ca: req.body.ca,
            maxHp: req.body.maxHp,
            hp: req.body.hp,
            dext_mod: req.body.dext_mod,
            strength_mod: req.body.strength_mod,
        },{
            new : true,
        }).exec();
        res.json(formatSuccess(car));
    } catch (error) {
        next(error);
    }
}