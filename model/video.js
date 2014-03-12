var model = require('../model')
  , fs = require('fs')
  , moment = require('moment')
  , path = require('path')
  , exec = require('child_process').exec
;

exports.createFromProgram = function(program, callback) {
  // record ts
  var tsName = getTSPath(program.eid, moment().format('YYYYMM'));
  var duration = program.duration / 1000;
  var cmdRec = 'recpt1 --b25 --strip '+program.phch+' '+duration+' '+tsName;
  console.log('start recording :'+cmdRec);
  exec(cmdRec, {timeout: program.duration+60000}, function(error, stdout, stderr) {
    console.log('end recording '+program.eid);
    callback(error);
  });
  // insert mongo
  var video = new model.video;
  video.sid = program.sid;
  video.phch = program.phch;
  video.eid = program.eid;
  video.title = program.title;
  video.detail = program.detail;
  video.duration = program.duration;
  video.categoryL = program.categoryL;
  video.categoryM = program.categoryM;
  video.month = moment().format('YYYYMM');
  video.encoded = false;
  video.save(function(err) {
  });
}

var encoder = {
  _encode : function() {
    self = this;
    if (self.videos.length <= self.index) {
      return;
    }
    var video = self.videos[self.index];
    self.index++;
    var ts = getTSPath(video.eid, video.month);
    if (!fs.existsSync(ts)) {
      console.log('not found : ' + video.eid);
      model.video
      .update({eid: video.eid}, {notfound: true})
      .exec(function(err) {
        self._encode();
      });
    } else {
      var mp4 = getMP4Path(video.eid, video.month);
      var cmdEnc = 'ffmpeg -i ' + ts
                 + ' -c:v libx264 -c:a libfaac -preset fast -deinterlace -f mp4 ' + mp4;
      console.log('start encode : ' + video.eid);
      exec(cmdEnc, function(error, stdout, stderr) {
        if (!error) {
          console.log('end encode');
          model.video
          .update({eid: video.eid}, {encoded: true})
          .exec(function(err) {
            self._encode();
          });
        } else {
          console.log('encode err ');
          self._encode();
        }
      });
    }
  },
  run : function(videos) {
    this.index = 0;
    this.videos = videos;
    this._encode();
  }
}

exports.encode = function() {
  console.log('start encode job : ' + new Date());
  model.video
  .find({
    encoded: {$ne: true},
    notfound: {$ne: true},
  })
  .exec(function(err, videos) {
    encoder.run(videos);
  });
}

exports.getEncodedList = function(callback) {
  model.video
  .find({encoded: true})
  .exec(function(err, videos) {
    callback(err, videos);
  });
}

exports.getMP4 = function(video) {
  return getMP4WebPath(eid, video.month);
}

var _getVideoPath = function(eid, month, type) {
  return path.resolve(__dirname, '..')
         + '/public/video/'
         + month+'/'+ 
         + eid+'.'+type;
}
var getTSPath = function(eid, month) {
  return _getVideoPath(eid, month, 'ts');
}
var getMP4Path = function(eid, month) {
  return _getVideoPath(eid, month, 'mp4');
}
var getMP4WebPath = function(eid, month) {
  return '/video/' + month + '/' + eid + '.mp4';
}


