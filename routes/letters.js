const express = require('express');
const router = express.Router();

/* GET home page. */

router.get('/list', (req, res, next) => {
  res.render('letters/list');
});

module.exports = router;
