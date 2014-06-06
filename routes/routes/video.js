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
  model.video.get(req.params.sid, req.params.eid, function(err, video) {
    res.render('video/screen', {
      video: video,
      mp4: model.video.getMP4WebPath(video)
    });
  });
}

exports.delete = function(req, res) {
  model.video.reserveDelete(req.params.sid, req.params.eid);
  res.redirect(req.get('referer'));
}
exports.cancelDelete = function(req, res) {
  model.video.cancelDelete(req.params.sid, req.params.eid, function(err) {
    res.redirect(req.get('referer'));
  });
}

exports.deleteList  = function(req, res) {
  model.video.deleteList(function(err, videos) {
    res.render('video/deleteList', {
      videos: videos
    });
  });
}
