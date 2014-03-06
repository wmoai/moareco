var cronJob = require('cron').CronJob
  , mongoose = require('mongoose')
  , model = require('./model')
  , exec = require('child_process').exec
  , epgdump = require('./epgdump')
  , reserved = require('./model/reserved')
;

var Program = model.program;
var tunerNum = 2;
var reservedPrograms = [];

var checkReserveJob = new cronJob({
  // cronTime: "0 */30 * * * *"
  cronTime: "0 * * * * *",
  onTick: function() {
    reserved.getNearestReserved(function(docs) {
      for(var i=0; i<docs.length; i++) {
        var program = docs[i];
        if (typeof(reservedPrograms[program.eid]) == 'undefined') {
          // reserve program
          console.log('reserve '+program.eid);
          reservedPrograms[program.eid] = new ReserveJob(program);
        } else {
          console.log('already');
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
      var tsName = '/mnt/data/samba/movie/'+program.eid+'.ts';
      var duration = program.duration / 1000;
      var cmdRec = 'recpt1 --b25 --strip '+program.phch+' '+duration+' '+tsName;
      console.log('start recording :'+cmdRec);
      exec(cmdRec, {timeout: program.duration+60000}, function(error, stdout, stderr) {
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
  cronTime: "0 5 * * * *",
  onTick: function() {
    console.log(new Date());
    epgdump();
  },
  onComplete: function() {
  },
  start: true,
  timeZone: "Asia/Tokyo"
});


