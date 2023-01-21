const mongoose = require('mongoose');
const path = require('path');

const imageBasePath = "uploads/plantImages"

const plantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    addedDate: {
        type: Date,
        required: true,
        default: Date.now,
    },
    lightRequirement: {
        type: String, 
    },
    waterRequirement: {
        type: String
    },
    imageName: {
        type: String,
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Author',
    }
});

plantSchema.virtual('imagePath').get(function() {
    if (this.imageName != null) {
        return path.join('/', imageBasePath, this.imageName);
    }
});

module.exports = mongoose.model('Plant', plantSchema);
module.exports.imageBasePath = imageBasePath;