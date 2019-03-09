'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const commentSchema = new Schema({
  text: {
    type: String,
    required: true
  },
  creator: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  letter: {
    type: ObjectId,
    ref: 'Letter',
    required: true
  }
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;