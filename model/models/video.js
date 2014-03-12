var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId
;

var Video = new Schema({
  sid: Number,
  phch: Number,
  eid: {type : Number, unique : true},
  title: String,
  detail: String,
  duration : Number,
  categoryL : String,
  categoryM : String,
  month : String,
  encoded : Boolean,
  notfound : Boolean
});

module.exports = mongoose.model('video', Video);
