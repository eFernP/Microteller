const express = require('express');
const router = express.Router();

const User = require('../models/User');
const Letter = require('../models/Letter');
const { requireAnon, requireUser, requireFields, requireFieldsLetter } = require('../middlewares/auth');

/* GET home page. */

router.get('/list', async (req, res, next) => {
  try {
    const letters = await Letter.find({lastLetter: null});
    res.render('letters/list', { letters });
  } catch (error) {
    next(error);
  }
});

router.get('/new', requireUser, function (req, res, next) {
  const data = {
    messages: req.flash('validation')
  };
  res.render('letters/create', data);
});

router.post('/new', requireUser, requireFieldsLetter, async (req, res, next) => {
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
    res.redirect('/letters/my-letters');
  } catch (error) {
    next(error);
  };
});

router.get('/my-letters', async (req, res, next) => {
  const { _id } = req.session.currentUser;
  try {
    //const tortilla = await Tortilla.findById(id).populate('creator');
    const letters = await Letter.find({creator:_id, lastLetter: null});
    res.render('letters/my-letters', { letters });
  } catch (error) {
    next(error);
  }
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

router.get('/:id/edit', requireUser, async (req, res, next) => {
  const { id } = req.params;
  const { _id } = req.session.currentUser;
  const data = {
    messages: req.flash('validation')
  };
  try {
    const letter = await Letter.findById(id);
    if (!letter.creator.equals(_id)) {
      res.redirect('/letters/list');
      return;
    }
    res.render('letters/edit', { letter, data });
  } catch (error) {
    next(error);
  };
});

router.post('/:id/edit', requireUser, requireFieldsLetter, async (req, res, next) => {
  const { _id, text, receiver, receiverEmail } = req.body;
  const letter = {
    text,
    receiver,
    receiverEmail
  };
  try {
    await Letter.findByIdAndUpdate(_id, letter);
    res.redirect('/letters/my-letters');
  } catch (error) {
    next(error);
  };
});

router.get('/:id/continue', requireUser, async (req, res, next) => {
  const { id } = req.params;
  const { _id } = req.session.currentUser;
  const data = {
    messages: req.flash('validation')
  };
  try {
    const letter = await Letter.findById(id);
    if (!letter.creator.equals(_id)) {
      res.redirect('/letters/list');
      return;
    }
    res.render('letters/continue', { letter, data });
  } catch (error) {
    next(error);
  };
});

router.post('/:id/continue', requireUser, requireFieldsLetter, async (req, res, next) => {
  const { text, receiver, receiverEmail } = req.body;
  const { id } = req.params;
  const { _id } = req.session.currentUser;
  let letter = {
    text,
    receiver,
    receiverEmail,
    lastLetter: id
  };
  try {
      letter.creator = req.session.currentUser._id;
      const newLetter = await Letter.create(letter);
      await Letter.findOneAndUpdate({creator:_id, receiver, nextLetter: null}, {nextLetter: newLetter.id});
    res.redirect('/letters/my-letters');
  } catch (error) {
    next(error);
  };
});

router.post('/:id/delete', requireUser, async (req, res, next) => {
  const { id } = req.params;
  const { _id } = req.session.currentUser;
  try {
    const letter = await Letter.findById(id);
    if (!letter.creator.equals(_id)) {
      res.redirect('/letters/list');
      return;
    }
    await Letter.findByIdAndDelete(id);
    res.redirect('/letters/my-letters');
  } catch (error) {
    next(error);
  };
});

module.exports = router;
