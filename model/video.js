var model = require('../model')
  , fs = require('fs')
  , moment = require('moment')
  , path = require('path')
  , exec = require('child_process').exec
  , spawn = require('child_process').spawn
;

exports.createFromProgram = function(program, callback) {
  // record ts
  var tsName = _getTSPath(program.sid, program.eid, moment().format('YYYYMM'));
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
  video.start = program.start;
  video.duration = program.duration;
  video.categoryL = program.categoryL;
  video.categoryM = program.categoryM;
  video.month = moment().format('YYYYMM');
  video.tags = [_getTitleTag(program.title)];
  video.encoded = false;
  video.save(function(err) {
  });
}

var encoder = {
  _encode : function() {
    var self = this;
    if (self.videos.length <= self.index) {
      return;
    }
    var video = self.videos[self.index];
    self.index++;
    var ts = _getTSPath(video.sid, video.eid, video.month);
    if (!fs.existsSync(ts)) {
      console.log('not found : ' + video.eid);
      model.video
      .update({
        sid: video.sid ,
        eid: video.eid
      }, {garbage: true})
      .exec(function(err) {
        self._encode();
      });
    } else {
      var mp4 = _getMP4Path(video.sid, video.eid, video.month);
      if (fs.existsSync(mp4)) {
        fs.renameSync(mp4, mp4 + moment().format('YYYYMMDDHHmmss'));
      }
      console.log('encode start : ' + video.eid + ' : ' + new Date());
      var ffmpeg = spawn(
        'ffmpeg',
        [
          '-i', ts,
          '-c:v', 'libx264',
          '-c:a', 'libfaac',
          '-fpre', '/usr/local/share/ffmpeg/libx264-hq-ts.ffpreset',
          '-deinterlace',
          '-async', '1',
          '-f', 'mp4',
          mp4
        ]
      );
      ffmpeg.stderr.on('data', function(data) {
        // console.log(data.toString('utf8'));
      });
      ffmpeg.on('close', function(code, signal) {
        if (code) {
          console.log('encode error : ' + video.eid + ' : ' + new Date());
          self._encode();
        } else {
          console.log('encode end : ' + video.eid + ' : ' + new Date());
          model.video
          .update({
            sid: video.sid ,
            eid: video.eid
          }, {encoded: true})
          .exec(function(err) {
            self._encode();
          });
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

exports.get = function(sid, eid, callback) {
  model.video
  .findOne({
    sid: sid,
    eid: eid
  })
  .exec(function(err, video) {
    callback(err, video);
  });
}

exports.getMP4WebPath = function(video) {
  return _getMP4WebPath(video.sid, video.eid, video.month);
}

var _getVideoPath = function(sid, eid, month, type) {
  return path.resolve(__dirname, '..')
         + '/public/video/'
         + month + '/'
         + sid + '/'
         + eid + '.' + type;
}
var _getTSPath = function(sid, eid, month) {
  return _getVideoPath(sid, eid, month, 'ts');
}
var _getMP4Path = function(sid, eid, month) {
  return _getVideoPath(sid, eid, month, 'mp4');
}
var _getMP4WebPath = function(sid, eid, month) {
  return '/video/' + month + '/' + sid + '/' + eid + '.mp4';
}

var _getTitleTag = function(title) {
  return title.replace(/【[^】]+】/g, '')
  .replace(/「[^」]+」/g, '')
  .replace(/[\s|#|＃|-].*$/, '');
}

exports.migrateTag = function() {
  model.video
  .find({})
  .exec(function(err, videos) {
    for (var i=0; i<videos.length; i++) {
      var video = videos[i];
      var ttag = _getTitleTag(video.title);
      video.tags = [ttag];
      video.save(function(err) {
        console.log(err);
      });
    }
  });
}
exports.tagList = function(callback) {
  model.video
  .aggregate({
    $unwind : '$tags' 
  }, {
    $group: {
      _id : '$tags',
      max: { $max : '$start' }
    }
  },{
    $sort: { max : -1 }
  },{ $project: {
    _id : 0,
    tag: '$_id'
  }
  }).exec(function(err, tags) {
    var arr = new Array();
    for (var i=0; i<tags.length; i++) {
      arr.push(tags[i].tag);
    }
    callback(err, arr);
  });
}

exports.searchTag = function(tag, callback) {
  model.video
  .find({tags: tag})
  .sort({start:1})
  .exec(function(err, videos) {
    callback(err, videos);
  });
}

exports.deleteTs = function() {
  model.video
  .find({
    $or: [
      { start:{ $exists : false} },
      { start:{ $lt : moment().subtract('weeks',1).unix()*1000 } }
    ],
    encoded : true,
    missingTs: {$ne:true}
  })
  .exec(function(err, videos) {
    for (var i=0; i<videos.length; i++) {
      var video = videos[i];
      var tsPath = _getTSPath(video.sid, video.eid, video.month)
      if (fs.existsSync(tsPath)) {
        fs.unlinkSync(_getTSPath(video.sid, video.eid, video.month));
      }
      video.missingTs = true;
      video.save(function(err) {
      });
    }
  });
}

exports.reserveDelete = function(sid, eid) {
  model.video
  .update({
    sid: sid,
    eid: eid
  }, {deleted : true})
  .exec(function(err) {
  });
}

exports.deleteList = function(callback) {
  model.video
  .find({deleted : true})
  .exec(function(err, videos) {
    callback(err, videos);
  });
}

exports.cancelDelete = function(sid, eid, callback) {
  model.video
  .update({
    sid: sid,
    eid: eid
  }, {deleted : false})
  .exec(function(err) {
    callback(err);
  });
}

exports.erase = function(sid, eid) {
  model.video
  .find({deleted : true})
  .exec(function(err, videos) {
    for (var i=0; i<videos.length; i++) {
      var video = videos[i];
      var ts = _getTSPath(video.sid, video.eid, video.month);
      var mp4 = _getMP4Path(video.sid, video.eid, video.month);
      if (fs.existsSync(ts)) {
        fs.unlinkSync(ts);
      }
      if (fs.existsSync(mp4)) {
        fs.unlinkSync(mp4);
      }
      video.remove(function(err) {
      });
    }
  });
}

// exports.migrateFile = function() {
  // model.video.find({})
  // .exec(function(err, videos) {
    // for (var i=0; i<videos.length; i++) {
      // var video = videos[i];
      // var ts = _getTSPath(video.eid, video.month);
      // if (fs.existsSync(ts)) {
        // var ts2 = _getTSPath2(video.sid, video.eid, video.month);
        // console.log('rename :' + ts2);
        // fs.renameSync(ts, ts2);
      // } else {
        // console.log('Not exists :' + ts);
      // }
      // var mp4 = _getMP4Path(videos[i].eid, videos[i].month);
      // if (fs.existsSync(mp4)) {
        // console.log('rename :' + mp4);
        // fs.renameSync(mp4, _getMP4Path2(video.sid, video.eid, video.month));
      // } else {
        // console.log('Not exists :' + mp4);
      // }

    // }
  // });
// }


