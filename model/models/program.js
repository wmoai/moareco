var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId
;

var Program = new Schema({
  sid: Number,
  phch: Number,
  eid: {type : Number, unique : true},
  channel: Number,
  title: String,
  detail: String,
  start: Number,
  end : Number,
  duration : Number,
  categoryL : String,
  categoryM : String,
  reserved : Boolean
});

module.exports = mongoose.model('program', Program);
