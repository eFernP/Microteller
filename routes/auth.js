'use strict';

const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

const User = require('../models/User');
const { requireAnon, requireUser, requireFields } = require('../middlewares/auth');

const saltRounds = 10;

router.get('/signup', requireAnon, (req, res, next) => {
  const data = {
    messages: req.flash('validation')
  };
  res.render('auth/signup', data);
});

router.post('/signup', requireAnon, requireFields, async (req, res, next) => {
  const { username, email, password, confirmedPassword } = req.body;

  try {
    const resultName = await User.findOne({ username });
    if (resultName) {
      req.flash('validation', 'This username is taken');
      res.redirect('/auth/signup');
      return;
    }

    const resultEmail = await User.findOne({ email });
    if (resultEmail) {
      req.flash('validation', 'There is an account with this email');
      res.redirect('/auth/signup');
      return;
    }
    if (password !== confirmedPassword){
      req.flash('validation', `The password fields doesn't match`);
      res.redirect('/auth/signup');
      return;
    }
    // Encriptar password
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Crear el user
    const newUser = {
      username,
      email,
      password: hashedPassword,
      voted :[],
      favorites:[]
    };
    const createdUser = await User.create(newUser);

    req.session.currentUser = createdUser;

    res.redirect('/home');
  } catch (error) {
    next(error);
  }
});

router.get('/login', requireAnon, (req, res, next) => {
  const data = {
    messages: req.flash('validation')
  };
  res.render('auth/login', data);
});

router.post('/login', requireAnon, requireFields, async (req, res, next) => {
  const { username, password } = req.body;

  try {
    let user = await User.findOne({ username });
    let userEmail = await User.findOne({ email: username });
    if (!user && !userEmail) {
      req.flash('validation', 'User name/email or password is incorrect');
      res.redirect('/auth/login');
      return;
    }
    if (!user) {
      comparePassword(userEmail);
    } else {
      comparePassword(user);
    }
  } catch (error) {
    next(error);
  }
  function comparePassword (user) {
    if (bcrypt.compareSync(password, user.password)) {
      req.session.currentUser = user;
      res.redirect('/home');
    } else {
      req.flash('validation', 'User name/email or password is incorrect');
      res.redirect('/auth/login');
    }
  }
});

router.post('/logout', requireUser, (req, res, next) => {
  delete req.session.currentUser;
  res.redirect('/');
});

module.exports = router;
