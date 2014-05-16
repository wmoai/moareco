var orm = require('../../model')
  , model = {
    video : require('../../model/video')
  }
;

exports.list = function(req, res) {
  model.video.tagList(function(err, tags) {
    // video.getEncodedList(function(err, videos) {
      res.render('video/list', { videos: [], tags: tags});
    // });
  });
}

exports.tagList = function(req, res) {
  model.video.tagList(function(err, tags) {
    model.video.searchTag(req.params.tag, function(err, videos) {
      res.render('video/list', {videos: videos, tags: tags});
    });
  });
}

exports.screen = function(req, res) {
  model.video.get(req.params.sid, req.params.eid, function(err, v) {
    res.render('video/screen', {
      video: v ,
      mp4: model.video.getMP4WebPath(v)
    });
  });
}
