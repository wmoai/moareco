var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId
;

var Video = new Schema({
  sid: Number,
  phch: Number,
  eid: Number,
  title: String,
  detail: String,
  start: Number,
  duration : Number,
  categoryL : String,
  categoryM : String,
  month : String,
  tags : [String],
  encoded : Boolean,
  missingTs : Boolean,
  deleted : Boolean
});

module.exports = mongoose.model('video', Video);
