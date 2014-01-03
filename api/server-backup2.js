var express 	= require('express'),
	  app			  = express(),
    port    	= 8000;


var http = require('http');
var sys = require('sys');
var destination = "localhost";
//var port = 8800;
var maxClients = 1;
var currentClients = 0;
var active = true;

var hs = null;

function activate() {
  if (!active && currentClients < maxClients) {
    hs.watcher.start();
    active = true;
  }
}

//server  	= require('http').createServer(app);
hs  	= http.createServer(function(req, res) {
    var proxy = http.createClient(80, destination);
    var preq = proxy.request(req.method, req.url, req.headers);
    console.log(req.connection.remoteAddress +" "+ req.method +" "+req.url);
    preq.on('response', function(pres) {
    res.writeHead(pres.statusCode, pres.headers);
    sys.pump(pres, res);
    pres.on('end', function() {
      preq.end();
      res.end();
      currentClients--;
      activate();
      });
    });
    
    req.on('data', function(chunk) {
      preq.write(chunk, 'binary');
    });
    
    req.on('end', function() {
      preq.end();
    });
    
    currentClients++;
    
    if (currentClients >= maxClients) {
      hs.watcher.stop();
      active = false;
    }
    
});

// listening to port...
hs.listen(port);

var io    = require('socket.io').listen(hs);

app.use(express.static(require('path').join(__dirname, '/')));

io.set('transports', [
        'websocket'
        , 'htmlfile'
        , 'xhr-polling'
        , 'jsonp-polling'
    ]);

console.log('Chat server is running and listening to port %d...', port);


io.sockets.on('connection', function (socket) {
  //var clients = io.sockets.clients();
  socket.on('connect', function(data){
		chatmessage(socket, data);
		//console.log('USERS CONECTADOS', clients.length);
	});
	
	socket.on('disconnect', function(){
	  //console.log('USERS DESCONECTADOS', clients.length);
	});
  
  
});

function chatmessage(socket, message){
	socket.broadcast.emit(message.nodo, { 'nolike': message.nolike, 'like': message.like, 'comment': message.comment, 'time': message.time, 'avatar': message.avatar, 'name': message.name, 'idusuario': message.idusuario, 'id': message.id, 'parent': message.parent, 'baneo': message.baneo, 'ncomments': message.ncomments, 'nodo': message.nodo});
}
