const express = require('express');
const router = express.Router();

const User = require('../models/User');
const Letter = require('../models/Letter');
const { requireAnon, requireUser, requireFields } = require('../middlewares/auth');

/* GET home page. */

router.get('/list', async (req, res, next) => {
  try {
    const letters = await Letter.find();
    res.render('letters/list', { letters });
  } catch (error) {
    next(error);
  }
});

router.get('/new', requireUser, function (req, res, next) {
  res.render('letters/create-edit');
});

router.post('/list', requireUser, async (req, res, next) => {
  const { _id, text, receiver, receiverEmail } = req.body;
  const letter = {
    text,
    receiver,
    receiverEmail
  };
  try {
    if (_id) {
      await Letter.findByIdAndUpdate(_id, letter);
    } else {
      letter.creator = req.session.currentUser._id;
      await Letter.create(letter);
    }
    res.redirect('/letters/list');
  } catch (error) {
    next(error);
  };
});

router.get('/:id', requireUser, async (req, res, next) => {
  const { id } = req.params;
  const { _id } = req.session.currentUser;
  try {
    const letter = await Letter.findById(id).populate('creator');
    let isCreator = false;
    if (letter.creator.equals(_id)) {
      isCreator = true;
    }
    res.render('letters/details', { letter, isCreator });
  } catch (error) {
    next(error);
  };
});

module.exports = router;
