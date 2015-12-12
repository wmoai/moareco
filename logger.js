var log4js = require('log4js');

log4js.configure({
  appenders : [
    {
      "type" : "dateFile",
      "category" : "backend",
      "filename" : "log/backend.log",
      "pattern" : "-yyyy-MM-dd"
    },
    {
      "type" : "file",
      "category" : "web",
      "filename" : "log/web.log",
      "pattern" : "-yyyy-MM-dd"
    }
  ]
});

exports.backend = log4js.getLogger("backend");
exports.web = log4js.getLogger("web");

