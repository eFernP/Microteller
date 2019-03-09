const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const { requireAnon, requireUser, requireFields, requireUserEditFields} = require('../middlewares/auth');
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
    const challenges = await Challenge.find();
    res.render('challenges/list', { challenges });
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
  const {ambit, objective} = req.body;
  const challenge = {
    ambit,
    objective
  };
  try {
    if (!objective){
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

router.get('/challenges/my-challenges', requireUser, function (req, res, next) {
  res.render('challenges/my-challenges');
});

router.get('/challenges/:id', requireUser, async (req, res, next) => {
  const { id } = req.params;
  try {
    const challenge = await Challenge.findById(id);
    const letters = await Letter.find({challenge:id});
    res.render('letters/list', { letters, challenge });
  } catch (error) {
    next(error);
  }
});

router.get('/account/edit', requireUser, async (req, res, next) => {
  const { _id } = req.session.currentUser;
  const data = {
    messages: req.flash('validation')
  };
  try {
    const user = await User.findById(_id);
    res.render('account-edit', {user, data});
  } catch (error) {
    next(error);
  };
});

router.post('/account/edit', requireUser, requireUserEditFields, async (req, res, next) => {
  let { username, email, password } = req.body;
  const { _id } = req.session.currentUser;
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

    if(!password){
      const passwordUser = await User.findOne({ _id });
      password = passwordUser.password;
    }else{
      const salt = bcrypt.genSaltSync(saltRounds);
      password = bcrypt.hashSync(password, salt);
    }
  
    const newInfo = {
      username,
      email,
      password
    };
    await User.findByIdAndUpdate(_id, newInfo);
    res.redirect('/account/edit');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
