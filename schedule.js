var fs = require('fs')
  , exec = require('child_process').exec
  , model = require('./model')
  , mongoose = require('mongoose');
;

mongoose.connect('mongodb://localhost/moareco');

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
    program.duration = data.duration;
    program.categoryL = data.category[0].large.ja_JP;
    program.categoryM = data.category[0].middle.ja_JP;
    program.save(function(err) {
      // if (err) { console.log(err); }
    });
  }
  console.log("epg reloaded.");
}

var epgDumper = {
  _getEpg : function() {
    self = this;
    if (self.channels.length <= self.index) {
      return;
    }
    // exec recpt1 here, and callback
    // var cmd = 'echo ' + self.channels[self.index];
    var cmd = 'cat epg.json';
    exec(cmd, {timeout: 1000}, function(error, stdout, stderr) {
      var epg = JSON.parse(stdout);
      // console.log(epg[0]);
      saveEpg(epg);
      self.index++;
      self._getEpg();
    });
  },
  get : function(channels) {
    this.index = 0;
    this.channels = channels;
    this._getEpg();
  }
}
var arr = new Array(1);
epgDumper.get(arr);



