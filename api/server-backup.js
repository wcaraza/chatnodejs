var express = require('express'),
    path = require('path'),
    http = require('http'),
    io = require('socket.io');

var app = express();

app.configure(function () {
    app.set('port', process.env.PORT || 8000);
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(function(req, res, next) {
      res.header('Access-Control-Allow-Credentials', true);
      res.header('Access-Control-Allow-Origin', req.headers.origin);
      //res.header("Access-Control-Allow-Origin", "*");
      res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
      //res.header("Access-Control-Allow-Headers", "X-Requested-With");
      //res.header('Access-Control-Allow-Headers',     'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
      res.header('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
      next();
    });
    app.use(express.static(path.join(__dirname, '/')));
});

var server = http.createServer(app);
io = io.listen(server);


io.configure(function () {
    io.set('authorization', function (handshakeData, callback) {
        /*if (handshakeData.xdomain) {
            callback('Cross-domain connections are not allowed');
        } else {
            callback(null, true);
        }*/
        callback(null, true);
    });
    io.enable('browser client minification');  // send minified client
    io.enable('browser client etag');          // apply etag caching logic based on version number
    io.enable('browser client gzip');          // gzip the file  
    io.set('transports', [                     // enable all transports (optional if you want flashsocket)
        'websocket'
        , 'flashsocket'
        , 'htmlfile'
        , 'xhr-polling'
        , 'jsonp-polling'
    ]);
    io.set("polling duration", 30);            // duracion maxima de long polling
});

server.listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});

var clients;

io.sockets.on('connection', function (socket) {
  clients = io.sockets.clients();
    socket.on('connect', function (message) {
        console.log("Got message: " + message);
        io.sockets.emit(message.nodo, { 'nolike': message.nolike, 'like': message.like, 'comment': message.comment, 'time': message.time, 'avatar': message.avatar, 'name': message.name, 'idusuario': message.idusuario, 'id': message.id, 'parent': message.parent, 'baneo': message.baneo, 'ncomments': message.ncomments, 'nodo': message.nodo});
    });

    socket.on('disconnect', function () {
        clients = io.sockets.clients();
        console.log("Socket disconnected");
        io.sockets.emit('pageview', { 'connections': Object.keys(io.connected).length});
        console.log(clients.length + " clients are connected");
    });
  console.log(clients.length + " clients are connected");
});
