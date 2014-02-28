var cronJob = require('cron').CronJob
  , mongoose = require('mongoose')
  , model = require('./model')
  , exec = require('child_process').exec
  , epgdump = require('./epgdump')
;

mongoose.connect('mongodb://localhost/moareco');

var Program = model.program;
var reserved = [];

var checkReserveJob = new cronJob({
  // cronTime: "0 */30 * * * *"
  cronTime: "*/5 * * * * *",
  onTick: function() {
    var now = new Date().getTime();
    var there = now + 2 * 3600 * 1000;
    Program
    .find({
      reserved:true,
      start:{
        '$gt':now,
        '$lt':there
      }
    })
    .exec(function(err, docs) {
      for(var i=0; i<docs.length; i++) {
        var program = docs[i];
        if (typeof(reserved[program.eid]) == 'undefined') {
          // reserve program
          console.log('reserve '+program.eid);
          reserved[program.eid] = new ReserveJob(program);
        }
      }
    });
  },
  onComplete: function() {
  },
  start: true,
  timeZone: "Asia/Tokyo"
});


// start recording
var ReserveJob = function(program) {
  this.program = program;
  this.job = new cronJob({
    cronTime: new Date(program.start),
    onTick: function() {
      // record start
      console.log(program.eid);
      var tsName = program.eid+'.ts';
      var duration = program.duration / 1000;
      var cmdRec = 'recpt1 --b25 --strip '+program.phch+' '+duration+' '+tsName;
      console.log('start recording '+program.eid);
      exec(cmdRec, {timeout: duration+60000}, function(error, stdout, stderr) {
        console.log('end recording '+program.eid);
      });
    },
    onComplete: function() {
      delete reserved[program.eid];
    },
    start: true,
    timeZone: "Asia/Tokyo"
  });
}


// update epg everyday 6 o'clock
var updateEpgJob = new cronJob({
  cronTime: "0 0 6 * * *",
  onTick: function() {
    epgdump();
  },
  onComplete: function() {
  },
  start: true,
  timeZone: "Asia/Tokyo"
});


