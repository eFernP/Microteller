const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const { requireAnon, requireUser, requireFields, requireUserEditFields} = require('../middlewares/auth');
const User = require('../models/User');

const saltRounds = 10;

/* GET home page. */
router.get('/', requireAnon, (req, res, next) => {
  res.render('index');
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
