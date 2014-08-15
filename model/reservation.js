var cronJob = require('cron').CronJob
  , model = require('../model')
  , sync = require('synchronize')
  , video = require('../model/video')
;

exports.create = function(id, callback) {
  model.program
  .findOne({
    _id: id
  }, function(err, program) {
    if (err) {
      callback(err);
      return;
    }
    var reservation = new model.reservation;
    reservation.sid = program.sid;
    reservation.phch = program.phch;
    reservation.title = _getGroupName(program.title);
    reservation.start = program.start;
    reservation.end = program.end;
    reservation.duration = program.duration;
    reservation.categoryL = program.categoryL;
    reservation.categoryM = program.categoryM;
    reservation.continue = true;
    reservation.interval = 1000*60*60*24*7;
    reservation.save(function(err) {
      model.program
      .update({_id: id}, {reserved: true})
      .exec(function(err) {
      });
      callback(err);
    });
  });
}

var _getGroupName = function(title) {
  return title.replace(/【[^】]+】/g, '')
  .replace(/「[^」]+」/g, '')
  .replace(/[\s|#|＃|-].*$/, '');
}

exports.remove = function(id, callback) {
  model.reservation
  .remove({_id:id})
  .exec(function(err) {
    callback(err);
  });
}

exports.getReserved = function(callback) {
  getReserved({}, callback);
}

exports.getList = function(callback) {
  model.reservation.find({}).exec(function(err, reservations) {
    callback(err, reservations);
  });
}

var reserving = [];

exports.reserve = function() {
  var now = new Date().getTime();
  var there = now + 2 * 3600 * 1000;
  getReserved({start:{'$lt':there}}, function(programs) {
    for(var i=0; i<programs.length; i++) {
      var program = programs[i];
      if (typeof(reserving[program.eid]) == 'undefined') {
        // reserve program
        console.log('reserve '+program.eid);
        reserving[program.eid] = new ReserveJob(program);
      }
    }
  });
}



var ReserveJob = function(program) {
  this.job = new cronJob({
    cronTime: new Date(program.start),
    onTick: function() {
      // record start
      video.createFromProgram(program, function(err) {
      });
    },
    onComplete: function() {
      delete reservedPrograms[program.eid];
    },
    start: true,
    timeZone: "Asia/Tokyo"
  });
}

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
          condition.doNotRecord = {$ne: true};
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


