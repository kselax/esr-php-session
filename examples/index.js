const express = require('express');
var esr_php_session = require('../index.js');
var io = require('socket.io');
http = require('http');
var app = express();
http = http.Server(app);
io = io(http);
http.listen(3000);

// app.listen(3000);

const path = require( 'path' );
app.use( express.static( path.join( __dirname + "/public" ) ) );

app.use(esr_php_session.express_session({
  esr_php_session_name: 'my_session',
  secret: 'my new secret',
  maxAge: (60 * 60 * 24), // by default 24 hours
  ex: 60,
}));

app.get('/', function(req, res){
  console.log(req.esr_php_session.views);
  if(req.esr_php_session.views || req.esr_php_session.views == 0){
    req.esr_php_session.views++;
  }else{
    req.esr_php_session.views = 0;
  }
  console.log('req.esr_php_session.views = ', req.esr_php_session.views);
  res.cookie('cookie_name1', 'cookie_value1');
  res.cookie('cookie_name2', 'cookie_value2');
  res.sendFile(__dirname + '/index.html');
});

io.use(esr_php_session.socket_io_session({
  esr_php_session_name: 'my_session',
  secret: 'my new secret',
  maxAge: (60 * 60 * 24), // by default 24 hours
  ex: 60,
}));

io.on('connection', function(socket){

  console.log('connected socket.id = ' + socket.id);

  if(socket.esr_php_session){
    if(socket.esr_php_session.views){
      socket.emit('message', socket.esr_php_session.views);
    }else{
      socket.esr_php_session.views = 0;
      socket.emit('message', socket.esr_php_session.views);
    }
  }

  socket.on('plus', function(msg){
    socket.esr_php_session.views++;
    socket.esr_php_session.save();
    socket.emit('message', socket.esr_php_session.views);
  });

  socket.on('zero', function(msg){
    socket.esr_php_session.views = 0;
    socket.esr_php_session.save();
    socket.emit('message', socket.esr_php_session.views);
  })

})
