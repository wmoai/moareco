var cronJob = require('cron').CronJob
  , mongoose = require('mongoose')
  , model = require('./model')
;

// mongoose.connect('mongodb://localhost/moareco');

var Program = model.program;

var checkReserveJob = new cronJob({
  // cronTime: "0 */30 * * * *"
  cronTime: "*/5 * * * * *",
  onTick: function() {
    // Program
    // .find({reserved:true, start:{'$lt':1390644010000}}, function(err, docs) {
      // console.log(docs);
    // });
  },
  onComplete: function() {

  },
  start: true,
  timeZone: "Asia/Tokyo"
});



// start recording
var ReserveJob = function() {
  this.eid = 60;
  this.job = new cronJob({

  });
}


// update epg everyday
var updateEpgJob = new cronJob({
  // cronTime: "0 0 6 * * *"
  cronTime: "*/5 * * * * *",
  onTick: function() {
    console.log(new Date());
  },
  onComplete: function() {

  },
  start: true,
  timeZone: "Asia/Tokyo"
});


