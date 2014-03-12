var model = require('../model')
  , reservation = require('../model/reservation')
  , program = require('../model/program')
  , video = require('../model/video')
;

exports.index = function(req, res) {
  model.service
  .find({}, function(err, services) {
    res.render('programs', { services: services});
  });
}

exports.movie = function(req, res) {
  res.render('movie');
}

exports.videos = function(req, res) {
  video.getEncodedList(function(err, videos) {
    res.render('videos', { videos: videos});
  });
}

exports.program = function(req, res){
  model.program
  .find({eid: req.params.id})
  .exec(function(err, docs) {
    res.render('program', { data: docs[0] });
  });
}

exports.search = function(req, res) {
  program.search(req.params.word, function(err, programs) {
    res.render('search', {programs: programs});
  });
};

exports.reserve = function(req, res) {
  reservation.createFromEid(req.params.id, function(err) {
    res.redirect('/reserved');
  });
}

exports.reserved = function(req, res) {
  reservation.getReserved(function(programs) {
    programs.sort(function(a,b) {
      return a.start - b.start;
    });
    reservation.getList(function(err, reservations) {
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

