const express = require('express');
const nodemailer = require('nodemailer');
const ObjectId = require('mongoose').Types.ObjectId;
const router = express.Router();

const User = require('../models/User');
const Letter = require('../models/Letter');
const Comment = require('../models/Comment');
const Challenge = require('../models/Challenge');
const { requireAnon, requireUser, requireFields, requireFieldsNewLetter, requireFieldsLetter } = require('../middlewares/auth');

/* GET home page. */

router.get('/list', requireUser, async (req, res, next) => {
  try {
    let letters = await Letter.find({ lastLetter: null });
    letters = reverseArray(letters);
    res.render('letters/list', { letters });
  } catch (error) {
    next(error);
  }
});

router.post('/list', (req, res, next) => {
  const {filter} = req.body;
  if(filter === 'All'){
    res.redirect(`/letters/list`);
    return;
  }
  res.redirect(`/letters/list/${filter}`);
});

router.post('/list/search', requireUser, (req, res, next) => {
  const {search} = req.body;
  console.log(search);
  if(!search){
    res.redirect(`/letters/list`);
    return;
  }
  res.redirect(`/letters/list/search/${search}`);
});

router.get('/list/search/:search', requireUser, async (req, res, next) => {
  const{search} = req.params;
  let letters = [];
  try {
    const user = await User.find({username: {"$regex": search, "$options": 'i'}});
    letters = await Letter.find({receiver: {"$regex": search, "$options": 'i'}, lastLetter:null});
    if(user){
      for(e of user){
        let lettersUserFound =  await Letter.find({creator:e.id, publicCreator: 'true', lastLetter:null});
        lettersUserFound.forEach(e=>{
          let inLetters =false;
          letters.forEach(letter=>{
            if(e.id === letter.id){
              inLetters = true;
            }
          });
          if(!inLetters){
            letters.push(e);
          }
        });
      }
    }
    letters = reverseArray(letters);
    res.render('letters/list', { letters});
  } catch (error) {
    next(error);
  }
});

router.get('/list/:filter', requireUser, async (req, res, next) => {
  const{filter} = req.params;
  try {
    let letters = await Letter.find({ lastLetter: null, ambit: filter});
    letters = reverseArray(letters);
    res.render('letters/list', { letters, filter });
  } catch (error) {
    next(error);
  }
});

router.get('/new', requireUser, function (req, res, next) {
  const data = {
    messages: req.flash('validation')
  };
  res.render('letters/create', {data});
});

router.post('/new', requireUser, async (req, res, next) => {
  const {text, ambit, receiver, email, challenge, publicUser} = req.body;
  const letter = {
    text,
    ambit,
    receiver,
    receiverEmail : email,
  };

  let transporter = emailTransporter();

  try {

    if(!receiver){
      req.flash('validation', 'Fill the first field');
      if(challenge){
        res.redirect(`/challenges/${challenge}/new`);
      }else{
        res.redirect(`/letters/new`);
      }
      return;
    }

    if(!text){
      req.flash('validation', 'Fill the text field');
      if(challenge){
        res.redirect(`/challenges/${challenge}/new`);
      }else{
        res.redirect(`/letters/new`);
      }
      return;
    }

    if(challenge){
      letter.challenge = challenge;
      letter.votes = 0;
    }
    letter.creator = req.session.currentUser._id;
    letter.visits = 0;
    letter.favorites = 0;
    if(publicUser === 'true'){
      letter.publicCreator = true;
    }else{
      letter.publicCreator = false;
    }
    const newLetter = await Letter.create(letter);
    await Letter.findByIdAndUpdate(newLetter.id, {set: newLetter.id});
    let reg = /\S+@\S+\.\S+/;
    if(email && reg.test(email)){
      await transporter.sendMail({
        from: '"Ester" <esterfern95@gmail.com>',
        to: email, 
        subject: 'Tienes una carta', 
        text,
        html: `<b>${text}</b>`
      });
    }
    if(!challenge){
      res.redirect('/letters/my-letters');
      return;
    }else{
      res.redirect('/challenges/my-challenges');
    }
    
  } catch (error) {
    next(error);
  };
});

router.get('/ranking', requireUser, async (req, res, next) => {
  try {
    let letters = await Letter.find({challenge: { $ne: null }, votes:{$ne: 0}}).sort({votes:-1}).limit(5);
    console.log(letters);
    res.render('letters/ranking', { letters });
  } catch (error) {
    next(error);
  }
});

router.get('/favorites', requireUser, async (req, res, next) => {
  const { _id } = req.session.currentUser;
  try {
    const user = await User.findById(_id);
    let letters = [];
    for(favorite of user.favorites){
      const letter = await Letter.findById(favorite);
      if(letter){
        letters.push(letter);
      }
    } 
    letters = reverseArray(letters);
    res.render('letters/favorites', { letters });
  } catch (error) {
    next(error);
  }
});


router.get('/my-letters', requireUser, async (req, res, next) => {
  const { _id } = req.session.currentUser;
  try {
    // const tortilla = await Tortilla.findById(id).populate('creator');
    let letters = await Letter.find({ creator: _id, lastLetter: null });
    letters = reverseArray(letters);
    res.render('letters/my-letters', { letters });
  } catch (error) {
    next(error);
  }
});

router.post('/my-letters', requireUser, (req, res, next) => {
  const {filter} = req.body;
  if(filter === 'All'){
    res.redirect(`/letters/my-letters`);
    return;
  }
  res.redirect(`/letters/my-letters/${filter}`);
});

router.get('/my-letters/:filter', requireUser, async (req, res, next) => {
  const{filter} = req.params;
  try {
    let letters = await Letter.find({ lastLetter: null, ambit: filter});
    letters = reverseArray(letters);
    res.render('letters/my-letters', { letters, filter });
  } catch (error) {
    next(error);
  }
});

router.post('/add-favorite', requireUser, async (req, res, next) => {
  const {id} = req.body;
  const {_id} = req.session.currentUser;
  try {
    const userUpdated = await User.findByIdAndUpdate(_id, {$push:{favorites:id}}, {new:true});
    const letter = await Letter.findById(id);
    let favorites = letter.favorites;
    favorites++;
    await Letter.findByIdAndUpdate(id, {favorites});
    req.session.currentUser = userUpdated;
    res.json(userUpdated);

  } catch (error) {
    next(error);
  };
});

router.post('/add-vote', requireUser, async (req, res, next) => {
  const {id} = req.body;
  const {_id} = req.session.currentUser;
  try {
    let letter = await Letter.findById(id);
    const user = await User.findByIdAndUpdate(_id, {$push:{voted:id}});
    let votes = letter.votes;
    votes++;
    letter = await Letter.findByIdAndUpdate(id, {votes});
    res.json(votes);
  } catch (error) {
    next(error);
  };
});

router.post('/remove-favorite', requireUser, async (req, res, next) => {
  const {id} = req.body;
  const {_id} = req.session.currentUser;
  try {
    const userUpdated = await User.findByIdAndUpdate(_id, {$pull:{favorites:id}}, {new:true});
    const letter = await Letter.findById(id);
    let favorites = letter.favorites;
    favorites--;
    await Letter.findByIdAndUpdate(id, {favorites});
    req.session.currentUser = userUpdated;
    res.json(userUpdated);

  } catch (error) {
    next(error);
  };
});




router.get('/:id', requireUser, async (req, res, next) => {
  const { id } = req.params;
  const { _id } = req.session.currentUser;
  const data = {
    messages: req.flash('validation')
  };
  if(!ObjectId.isValid(id)){
    return next();
  }
  try {
    const letter = await Letter.findById(id).populate('creator');
    const comments = await Comment.find({letter: id}).populate('creator');
    const challenge = await Challenge.findById(letter.challenge);
    let visits = letter.visits;
    visits++;
    await Letter.findByIdAndUpdate(id, {visits});
    let isCreator = false;
    let hasVoted = false;
    let isFavorite = false;
    if(_id){
      const user = await User.findById(_id);
      user.voted.forEach(element => {
        if (id === element){
          hasVoted = true;
        }
      });
    }else{
      hasVoted = true;
    }
    if(_id){
      const user = await User.findById(_id);
      user.favorites.forEach(element => {
        if (id === element){
          isFavorite = true;
        }
      });
    }else{
      isFavorite = true;
    }
    if (letter.creator.equals(_id)) {
      isCreator = true;
    }
    res.render('letters/details', { letter, isCreator, hasVoted, isFavorite, comments, challenge, data });
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
  if(!ObjectId.isValid(id)){
    return next();
  }
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
  const {text} = req.body;
  const {id} = req.params;
  const { _id } = req.session.currentUser;
  if(!ObjectId.isValid(id)){
    return next();
  }
  try {
    const letter = await Letter.findById(id);
    if (!letter.creator.equals(_id)) {
      res.redirect('/letters/list');
      return;
    }
    await Letter.findByIdAndUpdate(id, {text});
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
  if(!ObjectId.isValid(id)){
    return next();
  }
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
  const { text, receiver, set, email } = req.body;
  const { id } = req.params;
  const { _id } = req.session.currentUser;
  if(!ObjectId.isValid(id)){
    return next();
  }
  try {
      const letterParent = await Letter.findById(id); 
      const lastLetter = await Letter.findOne({set, nextLetter: null});
      if (!(letterParent.creator.equals(_id))) {
        res.redirect(`/letters/${id}`);
        return;
      }
      let letter = {
        text,
        ambit : letterParent.ambit,
        receiver,
        receiverEmail: email,
        set : letterParent.set,
        lastLetter: lastLetter.id, 
        publicCreator: letterParent.publicCreator
      };
      letter.creator = _id;
      letter.visits = 0;
      letter.favorites = 0;
      if(letterParent.challenge){
        letter.challenge = letterParent.challenge;
        letter.votes = 0;
      }
      const newLetter = await Letter.create(letter);
      await Letter.findByIdAndUpdate(lastLetter.id, {nextLetter: newLetter.id});
      let reg = /\S+@\S+\.\S+/;
      if(email && reg.test(email)){
        let transporter = emailTransporter();
        await transporter.sendMail({
          from: '"Ester" <esterfern95@gmail.com>',
          to: email, 
          subject: 'Tienes una carta', 
          text,
          html: `<b>${text}</b>`
        });
      }
    res.redirect(`/letters/${newLetter.id}`);
  } catch (error) {
    next(error);
  };
});

router.get('/:id/delete', requireUser, async (req, res, next) => {
  const { id } = req.params;
  if(!ObjectId.isValid(id)){
    return next();
  }
  res.render('letters/delete', { id });
});

router.post('/:id/delete', requireUser, async (req, res, next) => {
  const { id } = req.params;
  const { _id } = req.session.currentUser;
  if(!ObjectId.isValid(id)){
    return next();
  }
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
  const {id} = req.params;
  const {text} = req.body;
  const comment = {text};
  const {_id} = req.session.currentUser;

  if(!ObjectId.isValid(id)){
    return next();
  }
  try {
    comment.creator = _id;
    comment.letter = id;
    const commentWritten = await Comment.create(comment);
    const user = await User.findById(_id);
    const infoResponse = [user.username, commentWritten.text];
    res.json(infoResponse);
  } catch (error) {
    next(error);
  };
});


function reverseArray(arr){
  let newArr = [];
  for(let i = arr.length-1; i>=0; i--){
    newArr.push(arr[i]);
  }

  return newArr;
}


function emailTransporter(){
  let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'app.justsayit@gmail.com',
      pass: 'ironproyecto2'
    }
  });

  return transporter;
}

module.exports = router;
