var model = require('../model')
  , sync = require('synchronize')
  , reserved = require('../model/reserved')
;

exports.index = function(req, res) {
  model.service
  .find({}, function(err, docs) {
    res.render('programs', { services: docs});
  });
}

exports.movie = function(req, res) {
  res.render('movie');
}

exports.program = function(req, res){
  model.program
  .find({eid: req.params.id})
  .exec(function(err, docs) {
    res.render('program', { data: docs[0] });
  });
}

exports.search = function(req, res) {
  var regexp = new RegExp(req.params.word.replace(/^\s+|\s+$/g,'').replace(/\s+/g,'|'));
  model.program
  .find({
    '$or':[
      {'title':regexp},
      {'detail':regexp}
    ]
  })
  .sort({start:1})
  .exec(function(err, docs) {
    res.render('search', { programs: docs});
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
      res.redirect('/reserved');
    });
  });
}

exports.reserved = function(req, res) {
  reserved.getReserved(function(programs) {
    programs.sort(function(a,b) {
      return a.start - b.start;
    });
    model.reservation.find({}).exec(function(err, reservations) {
      res.render('reserved', {
        programs: programs,
        reservations: reservations
      });
    });
  });
}

exports.deleteReserved = function(req, res) {
  model.reservation
  .remove({_id:req.params.id})
  .exec(function(err) {
    res.redirect('/reserved');
  });
}


// ajax
exports.programs = function(req, res) {
  var condition = {};
  condition.sid = req.query.sid;
  condition.$or = [];
  condition.$or.push({
    start: {
      '$gte' : parseInt(req.query.start),
      '$lt' : parseInt(req.query.end)
    }
  });
  condition.$or.push({
    end: {
      '$gte' : parseInt(req.query.start),
      '$lt' : parseInt(req.query.end)
    }
  });

  model.program
  .find(condition)
  .sort({start:1})
  .limit(1000)
  .exec(function(err, docs) {
    res.send(docs);
  });
};

