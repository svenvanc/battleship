var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/game', function(req, res, next) {
  res.render('game', { title: 'Express' });
});

router.get('/data', function(req, res, next) {
  res.json({
    data: "test",
    error: false,
  });
});

router.post('/data', function(req, res, next) {
  console.log(req.body);
  const question = req.body.question;
  res.json({
    data: question + "12312",
  });
});


module.exports = router;
