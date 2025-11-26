const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['TEXT', 'IMAGE', 'VIDEO', 'AUDIO'],
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    fileName: String,
});

const jarSchema = new mongoose.Schema({
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    coverNote: {
        type: String,
        default: '',
    },
    notes: [noteSchema],
    senderName: {
        type: String,
        required: true,
    },
    recipientName: {
        type: String,
        required: true,
    },
    sentDate: {
        type: Date,
        default: Date.now,
    },
    openedDate: Date,
    direction: {
        type: String,
        enum: ['SENT', 'RECEIVED'],
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('Jar', jarSchema);
