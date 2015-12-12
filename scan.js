var model = require('./model')
  , ts = require('./model/ts.js')

var scanLoop = function(ch) {
  console.log(ch)
  if (ch > 15) {
    return
  }
  ts.getEpg(ch, function(err, epg) {
    console.log(epg)
    scanLoop(ch+1)
  })
}

scanLoop(13)
