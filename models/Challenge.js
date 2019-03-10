'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const challengeSchema = new Schema({
  objective: {
    type: String,
    required: true
  },
  ambit: {
    type: String,
    enum: ['Experiences', 'Family', 'Friends', 'Lovers', 'Me', 'Objects', 'Places', 'Others']
  },
  creator: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
});

const Challenge = mongoose.model('Challenge', challengeSchema);

module.exports = Challenge;