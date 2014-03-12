var model = require('../model')
  , moment = require('moment')
;

exports.search = function(word, callback) {
  var regexp = new RegExp(word.replace(/^\s+|\s+$/g,'').replace(/\s+/g,'|'));
  model.program
  .find({
    '$or':[
      {'title':regexp},
      {'detail':regexp}
    ]
  })
  .sort({start:1})
  .exec(function(err, programs) {
    callback(err, programs);
  });
}


