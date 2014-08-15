var exec = require('child_process').exec
  , crypto = require('crypto')
  , fs = require('fs')
  , tunerCount = 2
  , recodingCount = 0
  , logger = require('../logger')
;

var md5hex = function(str) {
  var md5sum = crypto.createHash('md5');
  md5sum.update(str);
  return md5sum.digest('hex');
}

var recode = function(phch, duration, output, callback) {
  if (recodingCount >= tunerCount) {
    logger.backend.error('no recodable tuner');
    return;
  }
  recodingCount++;
  var cmdRec = 'recpt1 --b25 --strip '+ phch +' '+ duration/1000 +' '+ output;
  exec(cmdRec, {timeout: duration+60000}, function(error, stdout, stderr) {
    recodingCount--;
    if (error) {
      logger.backend.error('recode error');
      logger.backend.error(error);
    }
    callback(error);
  });
}
exports.recode = recode;

var getEpg = function(phch, callback) {
  var hash = md5hex(phch + ',' + Date.now());
  var tsPath = 'tmp/'+hash+'.ts';
  var duration = 30000;
  recode(phch, duration, tsPath, function() {
    var epgPath = 'tmp/'+hash+'.json';
    var cmdEpg = 'epgdump json '+tsPath+' '+epgPath;
    exec(cmdEpg, {timeout: duration}, function(error, stdout, stderr) {
      fs.readFile(epgPath, 'utf8', function(error, data) {
        fs.exists(tsPath, function(exists) {
          if (exists) fs.unlink(tsPath, null);
        });
        fs.exists(epgPath, function(exists) {
          if (exists) fs.unlink(epgPath, null);
        });
        try {
          callback(null, JSON.parse(data));
        } catch(e) {
          logger.backend.error('epg parse error');
          logger.backend.error(e);
        }
      });
    });
  });
}
exports.getEpg = getEpg;

