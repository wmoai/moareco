var model = require('../model')
  , sync = require('synchronize')
;

exports.getReserved = function(callback) {
  model.reservation
  .find({})
  .exec(function(err, reservation) {
    if (reservation.length == 0) {
      callback();
    } else {
      sync.fiber(function(){
        var programs = [];
        for (var i=0; i<reservation.length; i++) {
          var title = reservation[i].title;
          var p = sync.await(
            model.program.find({
              title: new RegExp('^'+title)
              , sid: reservation[i].sid
            })
            .exec(sync.defer()));
          Array.prototype.push.apply(programs, p);
        }
        callback(programs);
      });
    }
  });
}

exports.getNearestReserved = function(callback) {
  var now = new Date().getTime();
  var there = now + 2 * 3600 * 1000;
  model.reservation
  .find({})
  .exec(function(err, reservation) {
    if (reservation.length == 0) {
      callback();
    } else {
      sync.fiber(function(){
        var programs = [];
        for (var i=0; i<reservation.length; i++) {
          var title = reservation[i].title;
          var p = sync.await(
            model.program.find({
              title: new RegExp('^'+title),
              sid: reservation[i].sid,
              start:{
                '$gt':now,
                '$lt':there
              }
            })
            .exec(sync.defer()));
          Array.prototype.push.apply(programs, p);
        }
        callback(programs);
      });
    }
  });
}
