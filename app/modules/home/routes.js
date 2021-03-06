var express = require('express');
var router = express.Router();
var db = require('../../lib/database')();
var flog = require('../welcome/loggedin');
var messCount = require('../welcome/messCount');
var prepend = require('../welcome/prepend');

function render(req,res){
  switch (req.valid) {
    case 1:
      res.render('welcome/views/invalid/adm-restrict');
      break;
    case 2:
    case 3:
      res.render('home/views/index', {thisUserTab: req.user, messCount: req.messCount[0].count});
      break;
  }
}
function guideRender(req,res){
  switch (req.valid) {
    case 1:
      res.render('welcome/views/invalid/adm-restrict');
      break;
    case 2:
    case 3:
      res.render('home/views/guide', {thisUserTab: req.user, messCount: req.messCount[0].count});
      break;
  }
}
function helpRender(req,res){
  switch (req.valid) {
    case 1:
      res.render('welcome/views/invalid/adm-restrict');
      break;
    case 2:
    case 3:
      res.render('home/views/help', {thisUserTab: req.user, messCount: req.messCount[0].count});
      break;
  }
}
function aboutRender(req,res){
  switch (req.valid) {
    case 1:
      res.render('welcome/views/invalid/adm-restrict');
      break;
    case 2:
    case 3:
      res.render('home/views/about', {thisUserTab: req.user, messCount: req.messCount[0].count});
      break;
  }
}
function teamRender(req,res){
  switch (req.valid) {
    case 1:
      res.render('welcome/views/invalid/adm-restrict');
      break;
    case 2:
    case 3:
      res.render('home/views/team', {thisUserTab: req.user, messCount: req.messCount[0].count});
      break;
  }
}
function searchRender(req,res){
  switch (req.valid) {
    case 1:
      res.render('welcome/views/invalid/adm-restrict');
      break;
    case 2:
    case 3:
      var searchquery = "%"+req.params.searchname.toString()+"%"
      db.query("SELECT * FROM tbluser WHERE strName LIKE ? AND intStatus!= 3 AND intType!= 1",[searchquery], (err, results, fields) => {
          if (err) console.log(err);
          if(!(!results[0])){
            for(count=0;count<results.length;count++){
              if (results[count].intType == 3 && results[count].intStatus == 1){
                results[count].intAccNo = 0;
              }
              results[count].prepend = prepend(results[count].intAccNo);
            }
            res.render('home/views/search', {thisUserTab: req.user, messCount: req.messCount[0].count, searchtab: results});
          }
          else{
            res.render('home/views/nosearch', {thisUserTab: req.user, messCount: req.messCount[0].count, noresult: req.params.searchname});
          }
      });
      break;
  }
}

router.get('/', flog, messCount, render);
router.get('/guide', flog, messCount, guideRender);
router.get('/help', flog, messCount, helpRender);
router.get('/about', flog, messCount, aboutRender);
router.get('/team', flog, messCount, teamRender);
router.get('/search/:searchname', flog, messCount, searchRender);

router.post('/search', flog, (req, res) => {
  res.redirect('/home/search/'+req.body.search);
});

exports.home = router;
