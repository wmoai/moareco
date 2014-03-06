var model = require('../model')
  , sync = require('synchronize')
  , reserved = require('../model/reserved')
;

exports.index = function(req, res) {
  var Service = model.service;
  Service.find({}, function(err, docs) {
    res.render('programs', { services: docs});
  });
};

exports.program = function(req, res){
  var Program = model.program;
  Program
  .find({eid: req.params.id})
  .exec(function(err, docs) {
    res.render('program', { data: docs[0] });
  });
};

exports.reserve = function(req, res) {
  var eid = req.params.id;
  model.program
  .findOne({eid: eid}, function(err, doc) {
    var reservation = new model.reservation;
    reservation.sid = doc.sid;
    reservation.phch = doc.phch;
    reservation.title = doc.title.replace(/[\s|#|＃|-].*$/, '');
    reservation.start = doc.start;
    reservation.end = doc.end;
    reservation.duration = doc.duration;
    reservation.categoryL = doc.categoryL;
    reservation.categoryM = doc.categoryM;
    reservation.continue = true;
    reservation.interval = 1000*60*60*24*7;
    reservation.save(function(err) {
      res.redirect('/program/'+eid);
    });
  });
}

exports.reserved = function(req, res) {
  reserved.getReserved(function(programs) {
    res.render('reserved', { programs: programs });
  });
}


// ajax
exports.programs = function(req, res) {
  var Program = model.program;
  Program
  .find({
    sid: req.query.sid,
    '$or': [
      {
        start: {
          '$gte' : parseInt(req.query.start),
          '$lt' : parseInt(req.query.end)
        }
      },
      {
        end: {
          '$gte' : parseInt(req.query.start),
          '$lt' : parseInt(req.query.end)
        }
      }
    ]
  })
  .sort({start:1})
  .limit(1000)
  .exec(function(err, docs) {
    res.send(docs);
  });
};

