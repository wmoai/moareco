var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId
;

var Movie = new Schema({
  sid: Number,
  phch: Number,
  eid: {type : Number, unique : true},
  title: String,
  detail: String,
  duration : Number,
  categoryL : String,
  categoryM : String,
  ts : String,
  mp4 : String,
  encoded : Boolean
});

module.exports = mongoose.model('movie', Movie);
