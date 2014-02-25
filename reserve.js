var cronJob = require('cron').CronJob
  , mongoose = require('mongoose')
  , model = require('./model')
;

mongoose.connect('mongodb://localhost/moareco');

var i = 0;
 
var cronTime = "* * * * * *";
var job = new cronJob({
  cronTime: cronTime
  , onTick: function() {
    var Reservation = model.reservation;
    Reservation.find({})
    .exec(function(err, docs) {
      console.log(docs);
    });
    if (i++ > 4) {
      job.stop();
    }
  }
  , onComplete: function() {
    console.log('onComplete!')
  }
  , start: false
  , timeZone: "Japan/Tokyo"
})
 
job.start();

// 30m check reserve
// every record
