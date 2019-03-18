'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const storySchema = new Schema({
  text: {
    type: String,
    required: true
  },
  genre: {
    type: String,
    enum: ['Realistic', 'Suspense', 'Fantasy', 'Science-fiction', 'Horror', 'Romance', 'Others']
  },
  title: {
    type: String,
    required: true
  },
  creator: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  set: {
    type: String
  },
  lastStory: {
    type: ObjectId,
    ref: 'Story'
  },
  nextStory: {
    type: ObjectId,
    ref: 'Story'
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
  },
  image: {
    type: String
  }

});

const Story = mongoose.model('Story', storySchema);

module.exports = Story;