const mongoose = require('mongoose');
const plant = require('./plant');
const Book = require('./plant');

const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    }
});

authorSchema.pre('remove', function(next) {
    plant.find({ author: this.id }, (err, plants) => {
        if (err) {
            next(err);
        } else if (plants.length > 0) {
            next(new Error('This author still has plants'));
        } else {
            next();
        }
    });
});

module.exports = mongoose.model('Author', authorSchema);