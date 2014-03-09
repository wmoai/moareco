var model = require('../model')
  , sync = require('synchronize')
  , moment = require('moment')
;

var getReserved = function(condition, callback) {
  model.reservation
  .find({})
  .exec(function(err, reservation) {
    if (reservation.length == 0) {
      callback();
    } else {
      sync.fiber(function(){
        var programs = [];
        for (var i=0; i<reservation.length; i++) {
          condition.title = new RegExp('^'+reservation[i].title);
          condition.sid = reservation[i].sid;
          if (!condition.start) {
            condition.start = {};
          }
          condition.start.$gt = new Date().getTime();
          var program = sync.await(model.program.find(condition)
            .exec(sync.defer()));
          Array.prototype.push.apply(programs, program);
        }
        callback(programs);
      });
    }
  });
}

exports.getReserved = function(callback) {
  getReserved({}, callback);
}

exports.getNearestReserved = function(callback) {
  var now = new Date().getTime();
  var there = now + 2 * 3600 * 1000;
  getReserved({start:{'$lt':there}}, callback);
}
