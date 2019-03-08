'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const letterSchema = new Schema({
  text: {
    type: String,
    required: true
  },
  receiver: {
    type: String
  },
  receiverEmail: {
    type: String
  },
  creator: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  lastLetter: {
    type: ObjectId,
    ref: 'Letter'
  }
});

const Letter = mongoose.model('Letter', letterSchema);

module.exports = Letter;
