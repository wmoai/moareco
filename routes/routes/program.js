var orm = require('../../model')
  , model = {
    program : require('../../model/program')
    , reservation : require('../../model/reservation')
  }
;

exports.table = function(req, res) {
  orm.service
  .find({}, function(err, services) {
    res.render('program/table', { services: services});
  });
}

exports.detail = function(req, res){
  orm.program
  .findOne({
    _id: req.params.id
  })
  .exec(function(err, program) {
    if (program.manualReserved
        || (program.manualReserved !== false && program.autoReserved == true)) {
      program.reserved = true;
    }
    res.render('program/detail', { data: program });
  });
}

exports.search = function(req, res) {
  if (req.params.word) {
    model.program.search(req.params.word, function(err, programs) {
      res.render('program/search', {programs: programs});
    });
  } else {
    res.render('program/search', {programs: []});
  }
}

exports.reserve = function(req, res) {
  model.reservation.create(req.params.id, function(err) {
    model.program.manualReserve(req.params.id, true, function(err) {
      res.redirect('/program/reserved');
      model.program.autoReserve();
    });
  });
}

exports.cancelReserve = function(req, res) {
  model.program.manualReserve(req.params.id, false, function(err) {
    res.redirect('/program/' + req.params.id);
  });
}

exports.reserved = function(req, res) {
  model.program.getReserved(function(programs) {
    programs.sort(function(a,b) {
      return a.start - b.start;
    });
    model.reservation.getList(function(err, reservations) {
      res.render('program/reserved', {
        programs: programs,
        reservations: reservations
      });
    });
  });
}

exports.deleteReserved = function(req, res) {
  model.reservation.remove(req.params.id, function(err) {
    res.redirect('/program/reserved');
  });
  model.program.removeAutoReserve(req.params.id, function(err) {
  });
}

exports.serviceList = function(req, res) {
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

  orm.program
  .find(condition)
  .sort({start:1})
  .limit(1000)
  .exec(function(err, programs) {
    res.send(programs);
  });
};

