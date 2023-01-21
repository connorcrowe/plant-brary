const express = require('express');
const { reset } = require('nodemon');
const router = express.Router();
const fs = require('fs');
const multer = require('multer');
const path = require('path');

const Plant = require('../models/plant');
const Author = require('../models/author');

const uploadPath = path.join('public', Plant.imageBasePath);
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']

const upload = multer({ 
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype))
    }
})

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
router.post('/', upload.single('cover'), async (req, res) => {
    const fileName = req.file != null ? req.file.filename : null;
    const plant = new Plant({
        name: req.body.name,
        author: req.body.author,
        lightRequirement: req.body.lightRequirement,
        waterRequirement: req.body.waterRequirement,
        description: req.body.description,
        imageName: fileName,
    });

    try { 
        const newPlant = await plant.save();
        //res.redirect(`plants/${newPlant.id}`);
        res.redirect('plants');
    } catch {
        if (plant.imageName != null) {
            removeImage(plant.imageName);
        }
        renderNewPage(res, plant, true);
    }
});

function removeImage(fileName) {
    fs.unlink(path.join(uploadPath, fileName), err => {
        if (err) console.error(err);
    });
}

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

module.exports = router;