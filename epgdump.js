var fs = require('fs')
  , exec = require('child_process').exec
  , model = require('./model')
;

var chs = [
  27,
  25,
  22,
  21,
  24,
  23,
  16
];

function saveEpg(epg, ch) {
  var programs = epg[0].programs;
  var service = new model.service;
  var sid = epg[0].service_id;
  service.id = sid;
  service.name = epg[0].name;
  service.save(function(err) {
  });

  for(var i=0; i<programs.length; i++) {
    var data = programs[i];
    var program = {};
    program.sid = sid;
    program.phch = ch;
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
    model.program.findOneAndUpdate({eid:program.eid}, program, {upsert:true}, function(err) {
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
    var cmdRec = 'recpt1 --b25 --strip '+ch+' 30 '+tsName;
    console.log("rec start "+ch);
    exec(cmdRec, {timeout: 90000}, function(error, stdout, stderr) {
      var epgName = 'tmp/tmp'+ch+'.json';
      var cmdDump = 'epgdump json '+tsName+' '+epgName;
      console.log("dump start "+ch);
      exec(cmdDump, {timeout: 2000}, function(error, stdout, stderr) {
        var cmdCat = 'cat '+epgName;
        exec(cmdCat, {timeout: 2000}, function(error, stdout, stderr) {
          try {
            var epg = JSON.parse(stdout);
            saveEpg(epg, ch);
          } catch (e) {
            console.log('parse err');
            console.log(stdout);
          }
          console.log("end "+ch);
          self.index++;
          self._getEpg();
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

module.exports = function() {
  console.log('start epgdump');
  epgDumper.get(chs);
};

