var model = require('../model')
  , fs = require('fs')
  , moment = require('moment')
  , path = require('path')
  , spawn = require('child_process').spawn
  , ts = require('./ts')
  , logger = require('../logger')
  ;

exports.createFromProgram = function(program, callback) {
  // record ts
  var tsName = _getTSPath(program.sid, program.eid, moment().format('YYYYMM'));
  logger.backend.info('start recoding : ' + program.phch);
  ts.record(program.phch, program.duration, tsName, function(error) {
    if (error) {
      logger.backend.error('record error');
    }
    logger.backend.info('end recoding : ' + program.phch);
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
    var tsPath = _getTSPath(video.sid, video.eid, video.month);
    if (!fs.existsSync(tsPath)) {
      logger.backend.warn('encode : ts not found ' + video._id);
      model.video
      .update({
        _id: video._id
      }, {garbage: true})
      .exec(function(err) {
        self._encode();
      });
    } else {
      var mp4 = _getMP4Path(video.sid, video.eid, video.month);
      if (fs.existsSync(mp4)) {
        fs.renameSync(mp4, mp4 + moment().format('YYYYMMDDHHmmss'));
      }
      var ffmpeg = spawn(
        'ffmpeg',
        [
          '-i', tsPath,
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
          logger.backend.error('encode error : ' + video.eid);
          self._encode();
        } else {
          logger.backend.info('encode end : ' + video.eid);
          model.video
          .update({
            _id: video._id
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
  logger.backend.info('start encode job');
  model.video
  .find({
    encoded: {$ne: true},
    notfound: {$ne: true}
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

exports.get = function(id, callback) {
  model.video
  .findOne({ _id: id })
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

String.prototype.mrRemoveNest = function(start, end) {
  start = "\\"+start;
  end = "\\"+end;
  var reg = new RegExp(start+"[^"+start+end+"]*|[^"+start+end+"]*"+end, "g");
  return this.replace(reg, '');
}

var _getTitleTag = function(title) {
  return title.mrRemoveNest('【', '】')
  .mrRemoveNest('「', '」')
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

exports.getNewList = function(callback) {
  model.video
  .find({encoded :true})
  .sort({start:-1})
  .limit(20)
  .exec(function(err, videos) {
    callback(err, videos);
  });
}

exports.searchTag = function(tag, callback) {
  model.video
  .find({
    tags: tag
  , encoded: true
  })
  .sort({start:-1})
  .exec(function(err, videos) {
    callback(err, videos);
  });
}

exports.deleteOldTs = function() {
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
      var tsPath = _getTSPath(video.sid, video.eid, video.month);
      if (fs.existsSync(tsPath)) {
        fs.unlinkSync(_getTSPath(video.sid, video.eid, video.month));
        logger.backend.info('delete ts : ' + video._id);
      }
      video.missingTs = true;
      video.save(function(err) {
      });
    }
  });
}

var _delete = function(id) {
  model.video
  .findOne({
    _id: id,
    deleted : true
  })
  .exec(function(err, video) {
    var tsPath = _getTSPath(video.sid, video.eid, video.month);
    if (fs.existsSync(tsPath)) {
      fs.unlinkSync(tsPath);
    }
    var mp4Path = _getMP4Path(video.sid, video.eid, video.month);
    if (fs.existsSync(mp4Path)) {
      fs.unlinkSync(mp4Path);
    }
    video.remove(function(err, video) {
      logger.backend.info('delete video : ' + video.sid + ',' + video.eid + ',' + video.month);
    });
  });
}

exports.deleteReserved = function() {
  _deleteList(function(err, videos) {
    for(var i=0; i<videos.length; i++) {
      _delete(videos[i]._id);
    }
  });
}

exports.reserveDelete = function(id) {
  model.video
  .update(
    { _id: id },
    {deleted : true})
  .exec(function(err) {
  });
}

var _deleteList = function(callback) {
  model.video
  .find({deleted : true})
  .exec(function(err, videos) {
    callback(err, videos);
  });
}
exports.deleteList = _deleteList;

exports.cancelDelete = function(id, callback) {
  model.video
  .update(
    { _id: id },
    { deleted : false })
  .exec(function(err) {
    callback(err);
  });
}

