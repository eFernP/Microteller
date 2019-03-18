'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const challengeSchema = new Schema({
  objective: {
    type: String,
    required: true
  },
  genre: {
    type: String,
    enum: ['Realistic', 'Suspense', 'Fantasy', 'Science-fiction', 'Horror', 'Romance', 'Others']
  },
  creator: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
});

const Challenge = mongoose.model('Challenge', challengeSchema);

module.exports = Challenge;