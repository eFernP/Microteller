const express = require('express');
const router = express.Router();

const User = require('../models/User');
const Letter = require('../models/Letter');
const Comment = require('../models/Comment');
const Challenge = require('../models/Challenge');
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
  const {text, ambit, receiver, receiverEmail, challenge} = req.body;
  const letter = {
    text,
    ambit,
    receiver,
    receiverEmail,
  };
  try {
    if (!receiver){
      letter.receiver = "Unknown";
    }
    if(challenge){
      letter.challenge = challenge;
      letter.votes = 0;
    }
    letter.creator = req.session.currentUser._id;
    const newLetter = await Letter.create(letter);
    await Letter.findByIdAndUpdate(newLetter.id, {set: newLetter.id});
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
    const comments = await Comment.find({letter: id}).populate('creator');
    const challenge = await Challenge.findById(letter.challenge);
    let isCreator = false;
    if (letter.creator.equals(_id)) {
      isCreator = true;
    }
    res.render('letters/details', { letter, isCreator, comments, challenge });
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
  const {_id, text} = req.body;
    try {
    await Letter.findByIdAndUpdate(_id, {text});
    res.redirect('/letters/my-letters');
  } catch (error) {
    next(error);
  };
  // const { _id, text, receiver, receiverEmail } = req.body;
  // const letter = {
  //   text,
  //   receiver,
  //   receiverEmail
  // };
  // try {
  //   await Letter.findByIdAndUpdate(_id, letter);
  //   res.redirect('/letters/my-letters');
  // } catch (error) {
  //   next(error);
  // };
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
  const { text, receiver, set, receiverEmail } = req.body;
  const { id } = req.params;
  const { _id } = req.session.currentUser;
  
  try {
      const letterParent = await Letter.findById(id); 
      const lastLetter = await Letter.findOne({set, nextLetter: null});
      let letter = {
        text,
        ambit : letterParent.ambit,
        receiver,
        receiverEmail,
        set : letterParent.set,
        lastLetter: lastLetter.id, 
      };
      letter.creator = req.session.currentUser._id;
      if(letterParent.challenge){
        letter.challenge = letterParent.challenge;
        letter.votes = 0;
      }
      const newLetter = await Letter.create(letter);
      await Letter.findByIdAndUpdate(lastLetter.id, {nextLetter: newLetter.id});
    res.redirect('/letters/my-letters');
  } catch (error) {
    next(error);
  };
});

router.get('/:id/delete', requireUser, async (req, res, next) => {
  const { id } = req.params;
  res.render('letters/delete', {id});
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
    const nextLetter = await Letter.findById(letter.nextLetter);
    const lastLetter = await Letter.findById(letter.lastLetter);
    if(lastLetter && nextLetter){
      await Letter.findByIdAndUpdate(letter.lastLetter, {nextLetter: nextLetter.id});
      await Letter.findByIdAndUpdate(letter.nextLetter, {lastLetter: lastLetter.id});
    } else if(nextLetter && !lastLetter){
      await Letter.findByIdAndUpdate(letter.nextLetter, {lastLetter: null});
    } else if(!nextLetter && lastLetter){
      await Letter.findByIdAndUpdate(letter.lastLetter, {nextLetter: null});
    }
    await Letter.findByIdAndDelete(id);
    res.redirect('/letters/my-letters');
  } catch (error) {
    next(error);
  };
});

router.post('/:id/comment', requireUser, async (req, res, next) => {
  const {text} = req.body;
  const { id } = req.params;
  const comment = {text};
  try {
    if(!text){
      res.redirect(`/letters/${id}`);
      return;
    }

    comment.creator = req.session.currentUser._id;
    comment.letter = id
    await Comment.create(comment);
    res.redirect(`/letters/${id}`);
  } catch (error) {
    next(error);
  };
});


module.exports = router;
