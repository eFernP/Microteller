const express = require('express');
const router = express.Router();

const User = require('../models/User');
const Letter = require('../models/Letter');
const { requireAnon, requireUser, requireFields } = require('../middlewares/auth');

/* GET home page. */

router.get('/list', (req, res, next) => {
  res.render('letters/list');
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

module.exports = router;
