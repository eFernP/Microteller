const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const { requireAnon, requireUser, requireFields, requireUserEditFields } = require('../middlewares/auth');
const User = require('../models/User');
const Letter = require('../models/Letter');
const Challenge = require('../models/Challenge');

const saltRounds = 10;

/* GET home page. */
router.get('/', requireAnon, (req, res, next) => {
  res.render('index');
});

router.get('/challenges/list', async (req, res, next) => {
  try {
    let challenges = await Challenge.find();
    challenges = reverseArray(challenges);
    res.render('challenges/list', { challenges });
  } catch (error) {
    next(error);
  }
});

router.post('/challenges/list', (req, res, next) => {
  const { filter } = req.body;
  if (filter === 'All') {
    res.redirect(`/challenges/list`);
    return;
  }
  res.redirect(`/challenges/list/${filter}`);
});


router.post('/challenges/list/search', async (req, res, next) => {
  const{search} = req.body;
  if (search){
    res.redirect(`/challenges/list/search/${search}`);
    return;
  }else{
    res.redirect(`/challenges/list`);
  }
});

router.get('/challenges/list/search/:search', async (req, res, next) => {
  const{search} = req.params;
  let challenges = [];
  try {
    const user = await User.find({username: {"$regex": search, "$options": 'i'}});
    challenges = await Challenge.find({objective: {"$regex": search, "$options": 'i'}});
    if(user){
      user.forEach(async e=>{
        let challengesUserFound =  await Challenge.find({creator:e.id});
        challengesUserFound.forEach(e=>{
          let inChallenges =false;
          challenges.forEach(challenge=>{
            if(e.id === challenge.id){
              inChallenges = true;
            }
          });
          if(!inChallenges){
            challenges.push(e);
          }
        });
      })
    }
    challenges = reverseArray(challenges);
    res.render('challenges/list', {challenges});
  } catch (error) {
    next(error);
  }
});

router.get('/challenges/list/:filter', async (req, res, next) => {
  const { filter } = req.params;
  try {
    let challenges = await Challenge.find({ ambit: filter });
    challenges = reverseArray(challenges);
    res.render('challenges/list', { challenges, filter });
  } catch (error) {
    next(error);
  }
});

router.get('/challenges/new', requireUser, function (req, res, next) {
  const data = {
    messages: req.flash('validation')
  };
  res.render('challenges/create', data);
});

router.post('/challenges/new', requireUser, async (req, res, next) => {
  const { ambit, objective } = req.body;
  const challenge = {
    ambit,
    objective
  };
  if (objective) {
    if (objective.length > 50) {
      req.flash('validation', 'Challenge goal too long');
      res.redirect('/challenges/new');
      return;
    }
  }
  try {
    if (!objective) {
      req.flash('validation', 'Fill the field');
      res.redirect('/challenges/new');
      return;
    }
    challenge.creator = req.session.currentUser._id;
    await Challenge.create(challenge);
    res.redirect('/challenges/my-challenges');
  } catch (error) {
    next(error);
  };
});

router.get('/challenges/my-challenges', requireUser, async (req, res, next) => {
  const { _id } = req.session.currentUser;
  try {
    let letters = await Letter.find({ creator: _id, challenge: { $ne: null }, lastLetter: null }).populate('challenge');
    let challenges = await Challenge.find({ creator: _id });
    res.render('challenges/my-challenges', { letters, challenges });
  } catch (error) {
    next(error);
  }
});

router.post('/challenges/my-challenges', (req, res, next) => {
  const {filter} = req.body;
  if(filter === 'All'){
    res.redirect(`/challenges/my-challenges`);
    return;
  }
  res.redirect(`/challenges/my-challenges/${filter}`);
});

router.get('/challenges/my-challenges/:filter', async (req, res, next) => {
  const{filter} = req.params;
  const { _id } = req.session.currentUser;
  
  try {
    let letters = await Letter.find({ creator: _id, challenge: { $ne: null }, lastLetter: null, ambit:filter }).populate('challenge');
    let challenges = await Challenge.find({ creator: _id });
    console.log(challenges);
    challenges = reverseArray(challenges);
    res.render('challenges/my-challenges', { challenges, letters, filter });
  } catch (error) {
    next(error);
  }
});

router.get('/challenges/:id', requireUser, async (req, res, next) => {
  const { id } = req.params;
  try {
    const challenge = await Challenge.findById(id).populate('creator');
    const letters = await Letter.find({ challenge: id, lastLetter: null });
    res.render('letters/list', { letters, challenge });
  } catch (error) {
    next(error);
  }
});

router.get('/challenges/:id/new', requireUser, async (req, res, next) => {
  const { id } = req.params;
  const challenge = await Challenge.findById(id);
  res.render('letters/create', { challenge });
});

router.get('/account/edit', requireUser, async (req, res, next) => {
  const { _id } = req.session.currentUser;
  const data = {
    messages: req.flash('validation')
  };
  try {
    const user = await User.findById(_id);
    res.render('account-edit', { user, data });
  } catch (error) {
    next(error);
  };
});

router.post('/account/edit', requireUser, requireUserEditFields, async (req, res, next) => {
  let { username, email, password, confirmedPassword } = req.body;
  const { _id } = req.session.currentUser;
  if (username) {
    if (username.length > 30) {
      req.flash('validation', 'User name too long.');
      res.redirect(`/account/edit`);
      return;
    }
  }
  if (email) {
    if (email.length > 50) {
      req.flash('validation', 'Email too long.');
      res.redirect(`/account/edit`);
      return;
    }
  }

  if (password) {
    if (password.length > 50) {
      req.flash('validation', 'Password too long.');
      res.redirect(`/account/edit`);
      return;
    }
  }
  try {
    const resultName = await User.findOne({ username });
    if (resultName && (resultName.id !== _id)) {
      req.flash('validation', 'This username is taken');
      res.redirect('/account/edit');
      return;
    }

    const resultEmail = await User.findOne({ email });
    if (resultEmail && (resultEmail.id !== _id)) {
      req.flash('validation', 'There is an account with this email');
      res.redirect('/account/edit');
      return;
    }

    if (!password) {
      const passwordUser = await User.findOne({ _id });
      password = passwordUser.password;
    } else {
      if (password === confirmedPassword) {
        const salt = bcrypt.genSaltSync(saltRounds);
        password = bcrypt.hashSync(password, salt);
      } else {
        req.flash('validation', 'The password fields do not match');
        res.redirect('/account/edit');
        return;
      }
    }

    const newInfo = {
      username,
      email,
      password
    };
    await User.findByIdAndUpdate(_id, newInfo);
    req.flash('validation', 'The changes have been done successfully');
    res.redirect('/account/edit');
  } catch (error) {
    next(error);
  }
});

function reverseArray(arr){
  let newArr = [];
  for(let i = arr.length-1; i>=0; i--){
    newArr.push(arr[i]);
  }

  return newArr;
}

module.exports = router;
