module.exports = {
  requireAnon (req, res, next) {
    if (req.session.currentUser) {
      res.redirect('/home');
      return;
    }
    next();
  },
  requireUser (req, res, next) {
    if (!req.session.currentUser) {
      res.redirect('/');
      return;
    }
    next();
  },

  requireFields (req, res, next) {
    const { username, password } = req.body;
    if (!password || !username) {
      req.flash('validation', 'Fill all the fields');
      res.redirect(`/auth${req.path}`);
      return;
    }
    next();
  },

  requireFieldsLetter (req, res, next) {
    const {receiver, text} = req.body;
    if (!text) {
      req.flash('validation', 'You have to write a letter');
      res.redirect(`/letters${req.path}`);
      return;
    }

    if(!receiver){
      req.flash('validation', 'Fill the first field');
      res.redirect(`/letters${req.path}`);
      return;
    }
    next();
  },

  requireUserEditFields (req, res, next) {
    const { username, email } = req.body;
    if (!email || !username) {
      req.flash('validation', 'Fill the user name and email fields');
      res.redirect(`${req.path}`);
      return;
    }
    next();
  },
};
