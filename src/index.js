const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app)
const io = require('socket.io').listen(server);
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const config = require('../config/main');
const router = require('./router');

//CONNECT SERVER WITH DATABSE--Database Connection
mongoose.Promise = global.Promise;
require('dotenv').config();
//mongoose.connect('mongodb://localhost:27017/Slack')
mongoose.connect('mongodb://raque47:Tommy-457@ds137882.mlab.com:37882/slack_clone')
  .then(
  () => console.log('Connected to MongoDB'),
  error => console.log('Error in connection to MongoDB')
  );

//SERVER
server.listen(config.port);
console.log('Your server is running on port ' + config.port + '.');

//MIDDLEWARE SECTION: Setting up basic middleware for all Express requests
app.use(morgan('dev')); // Log requests to API using morgan
// Enable CORS from client-side
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//ROUTER
router(app);

//SOKETS
var connections = [];
var usernames = {};

io.sockets.on('connection', function (socket) {

  // when the user disconnects
  socket.once('disconnect', function () {
    delete usernames[socket.username];
    io.sockets.emit('updateUsers', usernames);
    //socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
  });

  console.log('Alguien se ha conectado!! Socket id: ' + socket.id);
  //Somebody has been logged or connect
  socket.on('connected', (name) => {
    console.log('Connections antes ' + connections);
    connections[name] = socket.id;
    console.log('Connections despues ' + connections);
  });

  // when the client emits 'sendMessage', this listens and executes
  // name: id de usuario que lo envio,  connections[name]: id del socket de esa persona

  //username, content, idReceiver, hour);
  socket.on('sendMessage', (name, content, idReceiver, hour) => {
    //console.log('id', name, connections[name]);
    //console.log('socket.username: ', socket.username);
    var otherSocket = connections[idReceiver];
    var mySocket = connections[name];
    console.log('id emisor', name);
    console.log('id receptor', idReceiver);
    console.log('socket del otro ', otherSocket);
    console.log('mi socket ', mySocket);
    //io.to(otherSocket).emit('updateMessages',socket.username , content,idReceiver, hour);
    //io.to(mySocket).emit('updateMessages',socket.username , content,idReceiver, hour);
    socket.to(otherSocket).emit('updateMessages', name, content, idReceiver, hour);
  });
  // when the client emits 'addUser', this listens and executes
  socket.on('addUser', function (username) {
    socket.username = username;
    usernames['username'] = username;
    console.log('Estoy en addUser, usernames vale: ', usernames);
    io.sockets.emit('updateusers', usernames);
  });
  //rooms
  socket.on('subscribe', (room) => {
    console.log('joining room', room);
    socket.join("General");
  })

  socket.on('unsubscribe', function (room) {
    console.log('leaving room', room);
    socket.leave(room);
  })

  socket.on('sendBroadcast', (username, content, idReceiver, hour, channel) => {
    console.log('broadcast from server, channel:');
    console.log(channel);
    socket.broadcast.emit('updateMessagesBroadcast', username, content, idReceiver, hour, channel);
  });
});
