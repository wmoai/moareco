var log4js = require('log4js');

log4js.configure({
  appenders : [
    {
      "type" : "file",
      "category" : "backend",
      "filename" : "log/backend.log",
      "pattern" : "-yyyy-mm-dd"
    },
    {
      "type" : "file",
      "category" : "web",
      "filename" : "log/web.log",
      "pattern" : "-yyyy-mm-dd"
    }
  ]
});

exports.backend = log4js.getLogger("backend");
exports.web = log4js.getLogger("web");

