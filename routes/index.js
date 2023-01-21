const express = require('express');
const router = express.Router();
const Plant = require('../models/plant');

router.get('/', async (req, res) => {
    let plants = []
    try {
        plants = await Plant.find().sort({ addedDate: 'desc' }).limit(10).exec();
    } catch {
        plants = []
    }
    res.render('index', { plants: plants });
})

module.exports = router;