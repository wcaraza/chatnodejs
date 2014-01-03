var express = require('express'),
    path = require('path'),
    http = require('http'),
    io = require('socket.io');

var app = express();

app.configure(function () {
    app.set('port', process.env.PORT || 8001);
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.static(path.join(__dirname, '/')));
});

var server = http.createServer(app);
io = io.listen(server);

var chatClients = new Object();

io.configure(function (){
  io.set('authorization', function (handshakeData, callback) {
  
      console.log(handshakeData.headers.host);
      clientID = generateId();
      chatClients[clientID] = clientID
      console.log(chatClients);
      console.log(Object.keys(chatClients).length);
      
      if(handshakeData.headers.host == '10.10.38.102:8001'){
      
        callback(null, true);
        
      }else{

        if (Object.keys(chatClients).length<=5000) {
          callback(null, true);
        } else {
          delete chatClients[chatClients[Object.keys(chatClients)[0]]];
          console.log(chatClients);
          callback(null, false);
        }
      
      
      }
      
  });
  io.set("close timeout", 3);
  io.set("polling duration", 1);
  io.set("resource", "/socket.io");
  io.enable('browser client minification');  // send minified client
  io.enable('browser client etag');          // apply etag caching logic based on version number
  io.enable('browser client gzip');          // gzip the file
  io.set('transports', [
        'websocket'
        , 'htmlfile'
        , 'xhr-polling'
        , 'jsonp-polling'
    ]);
    io.set("log colors", true);
});

server.listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});


io.sockets.on('connection', function (socket) {
  
  socket.on('connect', function(data){
		chatmessage(socket, data);
		console.log(chatClients);
	});
	
	socket.on('disconnect', function(){
	  delete chatClients[chatClients[Object.keys(chatClients)[0]]];
	  console.log(chatClients);
	});
    
});

function chatmessage(socket, message){
	socket.broadcast.emit(message.nodo, { 'nolike': message.nolike, 'like': message.like, 'comment': message.comment, 'time': message.time, 'avatar': message.avatar, 'name': message.name, 'idusuario': message.idusuario, 'id': message.id, 'parent': message.parent, 'baneo': message.baneo, 'ncomments': message.ncomments, 'nodo': message.nodo});
}

function generateId(){
	var S4 = function () {
		return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
	};
	return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}
