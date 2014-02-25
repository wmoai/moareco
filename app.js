var express = require('express')
  , app = express()
  , routes = require('./routes')
  , mongoose = require('mongoose');
;

mongoose.connect('mongodb://localhost/moareco');

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.static(__dirname + '/public'));
  app.use(express.bodyParser());
});

app.listen(3000);

app.get('/', routes.index);
app.get('/programs', routes.programs);
app.get('/program/:id', routes.program);
app.post('/program/reserve/:id', routes.reserve);


