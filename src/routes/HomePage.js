import express from 'express';
var router = express.Router();

var HomePage = router.get('/', function(req, res) {
    res.render('HomePage');
});
module.exports = HomePage;