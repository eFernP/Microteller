'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const letterSchema = new Schema({
  text: {
    type: String,
    required: true
  },
  ambit: {
    type: String,
    enum: ['Experiences', 'Family', 'Friends', 'Lovers', 'Me', 'Objects', 'Places', 'Others']
  },
  receiver: {
    type: String,
    required: true
  },
  receiverEmail: {
    type: String
  },
  creator: {
    type: ObjectId,
    ref: 'User',
    required: true
  },

  publicCreator: {
    type: Boolean,
    required: true
  },
  set: {
    type: String
  },
  lastLetter: {
    type: ObjectId,
    ref: 'Letter'
  },
  nextLetter: {
    type: ObjectId,
    ref: 'Letter'
  },
  challenge: {
    type: ObjectId,
    ref: 'Challenge'
  },
  visits: {
    type: Number,
    required: true
  },
  favorites: {
    type: Number,
    required:true
  },
  votes: {
    type: Number,
  }

});

const Letter = mongoose.model('Letter', letterSchema);

module.exports = Letter;