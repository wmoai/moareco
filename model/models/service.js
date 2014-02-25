var mongoose = require('mongoose')
  , Schema = mongoose.Schema
;

var Service = new Schema({
  id: {type : Number, unique : true},
  name: String
});

module.exports = mongoose.model('service', Service);
