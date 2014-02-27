var fs = require('fs')
  , exec = require('child_process').exec
  , mongoose = require('mongoose')
  , model = require('./model')
;

mongoose.connect('mongodb://localhost/moareco');

var chs = [
  27,
  25,
  22,
  21,
  24,
  23,
  16
];

function saveEpg(epg) {
  var programs = epg[0].programs;
  var service = new model.service;
  var sid = epg[0].service_id;
  service.id = sid;
  service.name = epg[0].name;
  service.save(function(err) {
  });

  for(var i=0; i<programs.length; i++) {
    var data = programs[i];
    var program = new model.program;
    program.sid = sid;
    program.eid = data.event_id;
    program.title = data.title;
    program.detail = data.detail;
    program.start = data.start / 10;
    program.end = data.end / 10;
    program.duration = data.duration * 1000;
    if (data.category.length > 0) {
      program.categoryL = data.category[0].large.ja_JP;
      program.categoryM = data.category[0].middle.ja_JP;
    }
    program.save(function(err) {
      // if (err) { console.log(err); }
    });
  }
}

var epgDumper = {
  _getEpg : function() {
    self = this;
    if (self.channels.length <= self.index) {
      return;
    }
    var ch = self.channels[self.index];
    var tsName = 'tmp/tmp'+ch+'.ts';
    var cmdRec = 'recpt1 --b25 --strip '+ch+' 20 '+tsName;
    console.log("rec start "+ch);
    exec(cmdRec, {timeout: 30000}, function(error, stdout, stderr) {
      var epgName = 'tmp/tmp'+ch+'.json';
      var cmdDump = 'epgdump json '+tsName+' '+epgName;
      console.log("dump start "+ch);
      exec(cmdDump, {timeout: 2000}, function(error, stdout, stderr) {
        var cmdCat = 'cat '+epgName;
        exec(cmdCat, {timeout: 2000}, function(error, stdout, stderr) {
          var epg = JSON.parse(stdout);
          saveEpg(epg);
          self.index++;
          self._getEpg();
          console.log("end "+ch);
          fs.unlink(tsName);
          fs.unlink(epgName);
        });
      })
    });
  },
  get : function(channels) {
    this.index = 0;
    this.channels = channels;
    this._getEpg();
  }
}
epgDumper.get(chs);

