var fs = require('fs')
  , mongoose = require('mongoose')
;
mongoose.connect('mongodb://localhost/moareco');

fs.readdirSync(__dirname + '/models').forEach(function(filename) {
  if (/\.js$/.test(filename)) {
    var name = filename.substr(0, filename.lastIndexOf('.'));
    exports.__defineGetter__(name, function() {
      return require('./models/' + name);
    });
  }
});

