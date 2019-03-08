var express = require('express');
var backend = require('./backend/app');
const path = require('path');

const Message = require("./backend/models/message");
var Event = require("./backend/models/event");
var app = express();

// heroku stuff
const PORT = process.env.PORT || 3000

// connect to mongodb
app.use(backend)

//Set Engine
app.set("view engine","ejs");
//middlewares (changed for heroku)
app.use(express.static(path.join(__dirname, "client")));
//routes
app.get('/',(req,res)=>{
  res.render('index');
})

// heroku catch all route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/index.html' ));
})

var server = require('http').Server(app);
var io = require('socket.io')(server);

io.set('heartbeat timeout', 4000); 
io.set('heartbeat interval', 2000);


//arrays
connections = [];
online_users = [];
rooms = ["Work Chat","School Chat","Friend Chat"];

// changed for heroku
server.listen(PORT);

io.on('connection', function (socket) {
  //Console Updates
  console.log("Connected...id:"+socket.id);
  socket.username = "Anonymous"
  socket.room = "Not Chosen"
  connections.push(socket);
  console.log("Connected: %s sockets connected", connections.length);
  //Event to database
  var event = new Event({ socket_id :socket.id, username:socket.username , room:socket.room,action:`Anonymous user with id ${socket.id} made a connection`});
  event.save(function (err, event) {
    if (err) return console.error(err);
    console.log("Initial Anonymous Connection Event");
  });

  //Set Username and join Room
  socket.on("joinRoom", function(data,callback){
    callback(true);
    if(rooms.includes(data.room)){
      socket.join(data.room);
      socket.username = data.username;
      socket.room = data.room;
      connections[connections.indexOf(socket)].username = socket.username;
      online_users.push({socket_id: socket.id, username: socket.username, room: socket.room});
      console.log(online_users);
      io.sockets.in(data.room).emit("get users",online_users);
    }
});

  //Send Message
  socket.on('chat', function(data){
    io.sockets.to(data.room).emit('chat', data);
   });
  socket.on("typing",function(data){
    socket.broadcast.to(data.room).emit("typing",data.username);
  });

  //Disconnect
  socket.on("disconnect", function(data){
    connections.splice(connections.indexOf(socket),1);
    online_users.splice(online_users.indexOf({socket_id: socket.id ,username: socket.username, room: socket.room}),1);
    socket.broadcast.emit("get users",online_users);
    console.log("Disconnected: "+online_users.length +" users left"); 
    //Event to database
    var event = new Event({socket_id :socket.id, username:socket.username, room:socket.room,action:`${socket.username} with id ${socket.id} disconnected!`});
    event.save(function (err, event) {
    if (err) return console.error(err);
    console.log("Disconnection Event");
  });
  })
});