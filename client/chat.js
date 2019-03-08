//make connection
var socket = io(`${window.location.protocol}//${window.location.hostname}`);
//socket.heartbeatTimeout = 20000;
//Query DOM
var message = document.getElementById("message");
var btn = document.getElementById("send")
var discussion = document.getElementById("discussion");
var feedback = document.getElementById("feedback");
var userForm = document.getElementById("userForm");
var userFormArea = document.getElementById("userFormArea");
var messageArea = document.getElementById("messageArea");
var users = document.getElementById("users");
var username = document.getElementById("username");
var submitUser = document.getElementById("submitUser");
var room = document.getElementById("rooms");

//Emit events
btn.addEventListener("click", function(event){
    event.preventDefault();
    socket.emit("chat",{
        msg: message.value,
        user: username.value,
        room: room.value
    })
    //send message to DB
    axios.post('/api/history', {
        socket_id: socket.id,
        username: username.value,
        room: room.value,
        message: message.value
      })
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      });
    message.value = "";
});

submitUser.addEventListener("click", function(event){
    event.preventDefault();
    if(username.value === ""){
        alert("empty username");
        return false;
    }
    console.log(room.value);
    socket.emit("joinRoom",{ socket_id :socket.id,username: username.value , room: room.value},(data)=>{
        if(data){
            userFormArea.style.display = "none";
            messageArea.style.display = "block";
            //send event to DB
            axios.post('/api/eventlog', {
                socket_id: socket.id,
                username: username.value,
                room: room.value,
                action: `${username.id} chose ${username.value} as name and Logged in room ${room.value}`
              })
              .then(function (response) {
                console.log(response);
              })
              .catch(function (error) {
                console.log(error);
              });
        }
    });
    //username.value = "";
});

socket.on("get users", function(data){
    var html = "";
    for(i=0; i< data.length ; i++){
        if(data[i].room == room.value) {
            html += '<li class="list-group-item"><strong>'+data[i].username+'</strong> is online</li>';
        }
    }
    users.innerHTML = html;
})

//Listener for for typing
message.addEventListener("keypress", function(){
    socket.emit("typing",{username: username.value , room: room.value});
});

//Listen for messages
socket.on("chat", function(data){
    console.log(data.msg+";");
    feedback.innerHTML = "";
    discussion.innerHTML += "<p><strong>"+data.user+":</strong> "+data.msg+"</p>";
    discussion.scrollTop = discussion.scrollHeight;
});
//Listen for typing
socket.on("typing", function(user){
    feedback.innerHTML = "<p><em>"+user+" is typing...</em></p>"; 
});

