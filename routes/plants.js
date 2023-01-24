const express = require('express');
const { reset } = require('nodemon');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const Plant = require('../models/plant');
const Author = require('../models/author');
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']

router.get('/', async (req, res) => {
    let query = Plant.find();
    if (req.query.name != null && req.query.name != '') {
        query = query.regex('name', new RegExp(req.query.name, 'i'));
    }
    if (req.query.addedAfter != null && req.query.addedAfter != '') {
        query = query.gte('addedDate', req.query.addedAfter)
    }
    try {
        const plants = await query.exec();
        res.render('plants/index', {
            plants: plants,
            searchOptions: req.query,
        })
    } catch {
        res.redirect('/');
    }
});

// New Plant
router.get('/new', async (req, res) => {
    renderNewPage(res, new Plant());
});

// Create Plant
router.post('/', async (req, res) => {
    const fileName = req.file != null ? req.file.filename : null;
    const plant = new Plant({
        name: req.body.name,
        author: req.body.author,
        lightRequirement: req.body.lightRequirement,
        waterRequirement: req.body.waterRequirement,
        description: req.body.description,
    });

    saveImage(plant, req.body.cover)

    try { 
        const newPlant = await plant.save();
        //res.redirect(`plants/${newPlant.id}`);
        res.redirect('plants');
    } catch {
        renderNewPage(res, plant, true);
    }
});

async function renderNewPage(res, plant, hasError = false) {
    try { 
        const authors = await Author.find({});
        const params = {
            authors: authors,
            plant: plant,
        };
        if (hasError) params.errorMessage = 'Error creating plant';
        res.render('plants/new', params);
    } catch {
        res.redirect('/plants')
    }
}

function saveImage(plant, imageEncoded) {
    if (imageEncoded == null) return
    const image = JSON.parse(imageEncoded);
    if (image != null && imageMimeTypes.includes(image.type)) {
        plant.image = new Buffer.from(image.data, 'base64');
        plant.imageType = image.type;
    }
}

module.exports = router;