var cronJob = require('cron').CronJob
  , model = require('./model')
  , epgdump = require('./epgdump')
  , reservation = require('./model/reservation')
  , program = require('./model/program')
  , video = require('./model/video')
;

var checkReserveJob = new cronJob({
  cronTime: "0 */5 * * * *",
  onTick: function() {
    program.autoReserve();
    program.standbyRecord();
  },
  onComplete: function() {
  },
  start: true,
  timeZone: "Asia/Tokyo"
});
    program.standbyRecord();

// update epg everyday 6 o'clock
var updateEpgJob = new cronJob({
  cronTime: "0 6 * * * *",
  onTick: function() {
    epgdump();
  },
  onComplete: function() {
  },
  start: true,
  timeZone: "Asia/Tokyo"
});

// encode video
var encodeJob = new cronJob({
  cronTime: "0 0 6 * * *",
  onTick: function() {
    video.encode();
  },
  onComplete: function() {
  },
  start: true,
  timeZone: "Asia/Tokyo"
});

// delete job
var deleteJob = new cronJob({
  cronTime: "0 0 9 * * *",
  onTick: function() {
    video.deleteOldTs();
    video.deleteReserved();
  },
  onComplete: function() {
  },
  start: true,
  timeZone: "Asia/Tokyo"
});


