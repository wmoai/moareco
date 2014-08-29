var express = require('express')
  , app = express()
  , model = {
    program : require('../model/program')
  }
;

app.listen(3030);

app.get('/program/search/:word', function(req, res) {
  model.program.search(req.params.word, function(err, programs) {
    res.send(programs.slice(0,3));
  });
});


