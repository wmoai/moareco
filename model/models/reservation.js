var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId
;

var Reservation = new Schema({
  sid: Number,
  phch: Number,
  title: String,
  start: Number,
  end : Number,
  duration : Number,
  categoryL : String,
  categoryM : String,
  continue : Boolean,
  interval : Number
});

module.exports = mongoose.model('reservation', Reservation);

