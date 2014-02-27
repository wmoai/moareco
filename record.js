var cronJob = require('cron').CronJob
  , mongoose = require('mongoose')
  , model = require('./model')
;

mongoose.connect('mongodb://localhost/moareco');

// check reserve every 30m 
var checkReserve = function() {
  console.log(new Date().getTime());
}
checkReserve();

var checkReserveJob = new cronJob({
  // cronTime: "0 */30 * * * *"
  cronTime: "*/5 * * * * *"
  , onTick: function() {
    checkReserve();
  }
  , onComplete: function() {

  }
  , start: false
  , timeZone: "Japan/Tokyo"
});
checkReserveJob.start();



// start recording
var ReserveJob = function() {
  this.eid = 60;
  this.job = new cronJob({

  });
}


// update epg everyday

