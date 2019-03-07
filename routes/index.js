const express = require('express');
const router = express.Router();
const { requireAnon, requireUser, requireFields } = require('../middlewares/auth');
/* GET home page. */
router.get('/', requireAnon, (req, res, next) => {
  res.render('index');
});

module.exports = router;
