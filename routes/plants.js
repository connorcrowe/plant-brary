const express = require('express');
const { reset } = require('nodemon');
const router = express.Router();
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
        res.redirect(`plants/${newPlant.id}`);
    } catch {
        renderNewPage(res, plant, true);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const plant = await Plant.findById(req.params.id)
                                 .populate('author')
                                 .exec();
        res.render('plants/show', { plant: plant });
    } catch {
        res.redirect('/');
    }
});

// Edit plant
router.get('/:id/edit', async (req, res) => {
    try {
        const plant = await Plant.findById(req.params.id);
        renderEditPage(res, plant)
    } catch {
        res.redirect('/');
    }
});

// Update plant
router.put('/:id', async (req, res) => {
    let plant

    try { 
        plant = await Plant.findById(req.params.id);
        plant.name = req.body.name
        plant.author = req.body.author
        plant.lightRequirement = req.body.lightRequirement
        plant.waterRequirement = req.body.waterRequirement
        plant.description = req.body.description
        if (req.body.cover !== null && req.body.cover !== '') {
            
            saveImage(plant, req.body.cover);
        }
        await plant.save();
        res.redirect(`/plants/${plant.id}`);
    } catch (err) {
        console.log(err);
        if (plant != null) {
            renderEditPage(res, plant, true);
        } else {
            res.redirect('/');
        }
    }
});

// Delete plant
router.delete('/:id', async (req, res) => {
    let plant 
    try {
        plant = await Plant.findById(req.params.id);
        await plant.remove()
        res.redirect('/plants')
    } catch {
        if (plant != null) {
            res.render('plants/show' , {
                plant: plant,
                errorMessage: 'Could not remove plant'
            });
        } else {
            res.redirect('/');
        }
    }
});

async function renderNewPage(res, plant, hasError = false) {
    renderFormPage(res, plant, 'new', hasError);
}

async function renderEditPage(res, plant, hasError = false) {
    renderFormPage(res, plant, 'edit', hasError);
}

async function renderFormPage(res, plant, form, hasError = false) {
    try { 
        const authors = await Author.find({});
        const params = {
            authors: authors,
            plant: plant,
        }
        
        if (hasError) {
            if (form === 'edit') {
                params.errorMessage = 'Error editing plant';
            } else {
                params.errorMessage = 'Error creating plant';
            }
        }
        res.render(`plants/${form}`, params);
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