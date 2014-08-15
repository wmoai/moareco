var model = require('../model')
  , cronJob = require('cron').CronJob
  , video = require('../model/video')
;

var getReservedCondition = function() {
  return {
    $or:[
      {manualReserved: true},
      {$and:[
        {manualReserved: {$ne: false}},
        {autoReserved: true}
      ]}
    ]
  };
}

exports.search = function(word, callback) {
  var regexp = new RegExp(word.replace(/^\s+|\s+$/gi,'').replace(/\s+/g,'|'));
  model.program
  .find({
    '$or':[
      {'title':regexp},
      {'detail':regexp},
      {'categoryL':regexp}
    ]
  })
  .sort({start:1})
  .exec(function(err, programs) {
    callback(err, programs);
  });
}

exports.getReserved = function(callback) {
  model.program
  .find(getReservedCondition())
  .exec(function(err, docs) {
    callback(docs);
  });
}

exports.manualReserve = function(id, reserved, callback) {
  model.program
  .update({
    _id: id
  } ,{manualReserved: Boolean(reserved)})
  .exec(function(err) {
    callback(err);
  });
}

exports.autoReserve = function() {
  model.reservation
  .find({})
  .exec(function(err, reservations) {
    if (reservations.length == 0) {
      callback();
    } else {
      for (var i=0; i<reservations.length; i++) {
        var reservation = reservations[i];
        var condition = {
          title : new RegExp('^'+reservation.title) ,
          sid : reservation.sid ,
          manualReserved : {$ne: false} ,
          start : {$gt: new Date().getTime()}
        };
        model.program.find(condition)
        .exec(function(err, programs) {
          for(var i=0; i<programs.length; i++) {
            // update
            var program = programs[i];
            if (program.autoReserved == true) {
              continue;
            }
            program.autoReserved = true;
            program.autoReservationId = reservation._id;
            program.save(function(err) {
            });
          }
        });
      }
    }
  });
}

exports.removeAutoReserve = function(id) {
  model.program
  .update({autoReservationId: id}, {autoReserved:false}, {multi:true})
  .exec(function(err) {
  });
}

var standby = [];

exports.standbyRecord = function() {
  var now = new Date().getTime();
  var there = now + 2 * 3600 * 1000;
  var condition = getReservedCondition();
  condition.start = {
    $gt: new Date().getTime() ,
    $lt: there
  }
  model.program
  .find(condition)
  .exec(function(err, programs) {
    for(var i=0; i<programs.length; i++) {
      var program = programs[i];
      if (typeof(standby[program.eid]) == 'undefined') {
        // reserve program
        console.log('reserve '+program.eid);
        standby[program.eid] = new ReserveJob(program);
      }
    }
  });
}

exports.categories = function() {
  model.program
  .distinct('categoryL')
  .exec(function(err, categories) {
    console.log(categories);
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
      delete standby[program.eid];
    },
    start: true,
    timeZone: "Asia/Tokyo"
  });
}

