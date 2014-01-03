var net = require('net');
var redis = require('redis');

var pendingClients = {};

var redisClient = redis.createClient(26379, 'localhost');
redisClient.on('message', function (channel, message) {
    var client = pendingClients[channel];
    if (client) {
        client.res.write(message);
    }
});

var server = net.createServer(function (socket) {
    var buffer = '';
    socket.setEncoding('utf-8');
    socket.on('data', onData);

    function onData(chunk) {
        buffer += chunk;
        // Parse request data.
        // ...

        if ('I have got all I need') {
            socket.removeListener('data', onData);

            var req = {
                clientId: 'whatever'
            };
            var res = new ServerResponse(socket);
            server.emit('request', req, res);
        }  
    }
});

server.on('request', function (req, res) {
    if (res.socket.destroyed) {            
        return;
    }

    pendingClinets[req.clientId] = {
        res: res
    };

    redisClient.subscribe(req.clientId);

    res.socket.on('error', function (err) {
        console.log(err);
    });

    res.socket.on('close', function () {
        delete pendingClients[req.clientId];

        redisClient.unsubscribe(req.clientId);
    });
});

server.listen(3000);

function ServerResponse(socket) {
    this.socket = socket;
}
ServerResponse.prototype.write = function(data) {
    this.socket.write(data);
