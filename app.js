var express = require('express')
  , app = express()
  , routes = require('./routes')
;

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.static(__dirname + '/public'));
  app.use(express.bodyParser());
});

app.listen(3000);

app.get('/', routes.index);
app.get('/program/:id', routes.program);
app.post('/program/reserve/:id', routes.reserve);
app.get('/reserved', routes.reserved);
// ajax
app.get('/programs', routes.programs);
