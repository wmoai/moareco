var model = require('../model');

exports.index = function(req, res) {
  res.render('programs', { index: 'title'});
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
  var Program = model.program;
  Program
  .findOneAndUpdate({eid: eid}, {reserved: true}, function(err) {
    res.redirect('/program/'+eid);
  });
}


// ajax
exports.programs = function(req, res) {
  var Program = model.program;
  Program
  .find({
    end: {
      '$gt' : parseInt(req.query.start),
      '$lt' : parseInt(req.query.end)
    }
  })
  .sort({start:1})
  .limit(100)
  .exec(function(err, docs) {
    res.send(docs);
  });
};

