const mongoose = require('mongoose');

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
    image: {
        type: Buffer,
        required: true,
    },
    imageType: {
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
    if (this.image != null && this.imageType != null) {
        return `data:${this.imageType};charset=utf-8;base64,${this.image.toString('base64')}`
    }
});

module.exports = mongoose.model('Plant', plantSchema);