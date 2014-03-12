var cronJob = require('cron').CronJob
  , model = require('./model')
  , epgdump = require('./epgdump')
  , reservation = require('./model/reservation')
  , video = require('./model/video')
;

var checkReserveJob = new cronJob({
  cronTime: "0 */5 * * * *",
  onTick: function() {
    reservation.reserve();
  },
  onComplete: function() {
  },
  start: true,
  timeZone: "Asia/Tokyo"
});

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
    video.encode();

