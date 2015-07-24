var express = require('express')
  , app = express()
  , routes = require('./routes')
;

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.static(__dirname + '/public'));
  app.use(express.static(__dirname + '/bower_components'));
  app.use(express.json());
  app.use(express.urlencoded());
});

app.listen(3000);

app.get('/', routes.program.schedule);
app.get('/test', routes.program.table);

app.post('/program/reserve/:id', routes.program.reserve);
app.post('/program/reserve/cancel/:id', routes.program.cancelReserve);
app.get('/program/reserved', routes.program.reserved);
app.post('/program/reserved/delete/:id', routes.program.deleteReserved);
app.get('/program/search', routes.program.search);
app.get('/program/search/:word', routes.program.search);
app.get('/program/service', routes.program.serviceList);
app.get('/program/:id', routes.program.detail);

app.get('/video/tag/:tag', routes.video.tagList);
app.get('/video/delete', routes.video.deleteList);
app.post('/video/delete/:id', routes.video.delete);
app.post('/video/delete/cancel/:id', routes.video.cancelDelete);
app.get('/video/:id', routes.video.screen);
app.get('/video', routes.video.list);

