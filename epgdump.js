var model = require('./model')
  , moment = require('moment')
  , ts = require('./model/ts.js')
  , logger = require('./logger')
;
moment.lang('ja');

var chs = [
  27,
  25,
  22,
  21,
  24,
  23,
  16,
  32
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
    program.date = moment(program.start).format('YYYY/MM/DD (ddd) HH:mm:ss - ')
                   + moment(program.end).format('HH:mm:ss');
    model.program.findOneAndUpdate({
      eid: program.eid,
      sid: program.sid
    }, program, {upsert:true}, function(err) {
    });
  }
}

var epgDumper = {
  _getEpg : function() {
    var self = this;
    if (self.channels.length <= self.index) {
      logger.backend.info('end epgdump');
      return;
    }
    var ch = self.channels[self.index];
    self.index++;
    ts.getEpg(ch, function(err, epg) {
      if (!err) {
        saveEpg(epg, ch);
      }
      self._getEpg();
    });
  },
  get : function(channels) {
    this.index = 0;
    this.channels = channels;
    this._getEpg();
  }
}

module.exports = function() {
  logger.backend.info('start epgdump');
  model.program
  .remove({end : {'$lt' : moment().subtract('hours', 6).valueOf() }})
  .exec(function (err) {
  });
  epgDumper.get(chs);
};

