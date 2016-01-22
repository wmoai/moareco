var orm = require('../../model')
  , model = {
    video : require('../../model/video')
  }
;

exports.list = function(req, res) {
  model.video.tagList(function(err, tags) {
    model.video.getNewList(function(err, videos) {
      res.render('video/library', { videos: videos, tags: tags});
    });
  });
}

exports.tagList = function(req, res) {
  model.video.tagList(function(err, tags) {
    model.video.searchTag(req.params.tag, function(err, videos) {
      res.render('video/library', {
        videos: videos
      , tags: tags
      , selected: req.params.tag
      , listDeletable: true
      });
    });
  });
}

exports.screen = function(req, res) {
  model.video.get(req.params.id, function(err, video) {
    res.render('video/screen', {
      video: video,
      mp4: model.video.getMP4WebPath(video)
    });
  });
}

exports.delete = function(req, res) {
  model.video.reserveDelete(req.params.id);
  res.redirect(req.get('referer'));
}
exports.deleteAll = function(req, res) {
  var ids = req.body.ids;
  if (ids) {
    ids.forEach(function(id) {
      model.video.reserveDelete(id);
    });
  }
  res.redirect(req.get('referer'));
}
exports.cancelDelete = function(req, res) {
  model.video.cancelDelete(req.params.id, function(err) {
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
