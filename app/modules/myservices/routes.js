var express = require('express');
var router = express.Router();
var db = require('../../lib/database')();
var flog = require('../welcome/loggedin');
var numberFormat = require('../welcome/numberFormat');
var messCount = require('../welcome/messCount');

function servTags(req, res, next){
  /*All Service Tags
  strServName(tblservicetag)*/
  db.query("SELECT strServName FROM tblservicetag", function (err, results, fields) {
      if (err) return res.send(err);
      req.servTags = results;
      return next();
  });
}
function searchServTag(req, res, next){
  /*Searched Service Tag, Match(body);
  *(tblservicetag)*/
  db.query("SELECT * FROM tblservicetag WHERE strServName= ?",[req.body.searchtag], (err, results, fields) => {
      if (err) return res.send(err);
      req.searchServTag = results;
      return next();
  });
}
function searchServAcc(req, res, next){
  /*Selected Service of Current User, Match(body,session);
  *(tblservicetag)*(tblservice)*/
  db.query("SELECT * FROM tblservicetag INNER JOIN tblservice ON intServTagID= intServTag WHERE strServName= ? AND intServAccNo= ?",[req.body.searchtag, req.session.user], (err, results, fields) => {
      if (err) return res.send(err);
      req.searchServAcc = results;
      return next();
  });
}
function myServices(req, res, next){
  /*Current User's Services, Match(session);
  *(tbluser)*(tblservice)*(tblservicetag)*(tblchat)*/
  db.query("SELECT * FROM tbluser INNER JOIN tblservice ON intAccNo= intServAccNo INNER JOIN tblservicetag ON intServTag= intServTagID WHERE intAccNo= ?",[req.session.user], (err, results, fields) => {
      if (err) return res.send(err);
      if(!(!results[0])){
        for(count=0;count<results.length;count++){
          results[count].formatPrice = numberFormat(results[count].fltPrice.toFixed(2));
        }
      }
      req.myServices = results;
      return next();
  });
}
function servValidation(req, res, next){
  /*Service selected by current user + servtag, Match(session,params);
  *(tblservice)*(tblservicetag)*(tblchat)*/
  db.query("SELECT * FROM tblservice INNER JOIN tblservicetag ON intServTag= intServTagID WHERE intServAccNo= ? AND intServStatus!= 2 AND intServID= ?",[req.session.user, req.params.servid], (err, results, fields) => {
      if (err) return res.send(err);
      req.servValidation = results;
      return next();
  });
}
function servOngoing(req, res, next){
  /*All UnavOngoing Services of Current User, Match(session)
  *(tblservice)*/
  db.query("SELECT * FROM tblservice WHERE intServAccNo= ? AND intServStatus= '2' ",[req.session.user], (err, results, fields) => {
      if (err) return res.send(err);
      req.servOngoing = results;
      return next();
  });
}

function render(req,res){
  switch (req.valid) {
    case 1:
      res.render('welcome/views/invalid/adm-restrict');
      break;
    case 2:
    case 3:
      if(!req.myServices[0])
        res.render('myservices/views/noservice', {thisUserTab: req.user, messCount: req.messCount[0].count});
      else
        res.render('myservices/views/index', {thisUserTab: req.user, messCount: req.messCount[0].count, myServices: req.myServices});
      break;
  }
}
function successRender(req,res){
  switch (req.valid) {
    case 1:
      res.render('welcome/views/invalid/adm-restrict');
      break;
    case 2:
    case 3:
      if(!req.myServices[0])
        res.render('myservices/views/noservice', {thisUserTab: req.user, messCount: req.messCount[0].count});
      else{
        res.render('myservices/views/success', {thisUserTab: req.user, messCount: req.messCount[0].count, myServices: req.myServices});
      }
      break;
  }
}
function editRender(req,res){
  switch (req.valid) {
    case 1:
      res.render('welcome/views/invalid/adm-restrict');
      break;
    case 2:
    case 3:
      if(!req.myServices[0])
        res.render('myservices/views/noservice', {thisUserTab: req.user, messCount: req.messCount[0].count});
      else{
        if(!req.servValidation[0])
          res.render('myservices/views/invalid/noaccess', {thisUserTab: req.user, messCount: req.messCount[0].count, myServices: req.myServices});
        else
          res.render('myservices/views/edit', {thisUserTab: req.user, messCount: req.messCount[0].count, myServices: req.myServices, servValidation: req.servValidation});
      }
      break;
  }
}

router.get('/', flog, messCount, myServices, render);
router.get('/success', flog, messCount, myServices, successRender);
router.get('/:servid', flog, messCount, myServices, servValidation, editRender);

router.post('/', flog, messCount, myServices, searchServTag, searchServAcc, servOngoing, (req, res) => {
  if(!req.searchServTag[0]){
    res.render('myservices/views/invalid/notag', {servTag: req.body.searchtag, myServices: req.myServices});
  }
  else{
    if(!req.searchServAcc[0]){
      if(!req.servOngoing[0]){
        db.query("INSERT INTO tblservice (intServTag, intServAccNo, intServStatus, fltPrice, intPriceType) VALUES (?,?,'1',?,?)",[req.searchServTag[0].intServTagID, req.session.user, req.body.price, req.body.pricetype], (err, results, fields) => {
          if (err) return res.send(err);
          res.redirect('/myservices/success');
        });
      }
      else{
        db.query("INSERT INTO tblservice (intServTag, intServAccNo, intServStatus, fltPrice, intPriceType) VALUES (?,?,'2',?,?)",[req.searchServTag[0].intServTagID, req.session.user, req.body.price, req.body.pricetype], (err, results, fields) => {
          if (err) return res.send(err);
          res.redirect('/myservices/success');
        });
      }
    }
    else{
      res.render('myservices/views/invalid/alreadyadded', {servTag: req.searchServTag[0].strServName, myServices: req.myServices});
    }
  }
});
router.post('/:servid', flog, messCount, servValidation, myServices, servOngoing, (req, res) => {
  if(!req.servValidation[0]){
    res.render('myservices/views/invalid/noaccess', {thisUserTab: req.user, messCount: req.messCount[0].count, myServices: req.myServices});
  }
  if(!(!req.servOngoing[0])){
    res.render('myservices/views/invalid/noaccess', {thisUserTab: req.user, messCount: req.messCount[0].count, myServices: req.myServices});
  }
  else{
    db.query("UPDATE tblservice SET intServStatus= ?, intPriceType= ?, fltPrice= ? WHERE intServID= ?",[req.body.status, req.body.pricetype, req.body.price, req.params.servid], (err, results, fields) => {
        if (err) return res.send(err);
        res.redirect('/myservices');
    });
  }
});

exports.myservices = router;
