var fs = require('fs')
;

fs.readdirSync(__dirname + '/routes').forEach(function(filename) {
  if (/\.js$/.test(filename)) {
    var name = filename.substr(0, filename.lastIndexOf('.'));
    exports.__defineGetter__(name, function() {
      return require('./routes/' + name);
    });
  }
});

