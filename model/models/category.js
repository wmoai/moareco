var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId
;

var Category = new Schema({
  name : {
    type : String,
    index: {unique: true}
  },
  pname : String
});
console.log("init");

module.exports = mongoose.model('category', Category);
