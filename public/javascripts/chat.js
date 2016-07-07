var socket = io(); 

function submitfunction(){
  var from = $('#user').val();
  var message = $('#m').val();
  var to=$('#to').val();
  if(message != '' && from!=to) {
    $('#messages').append('<li style="display:block;background:#18ffff; float :right"><b style="color:green">' + "Me to "+ to + '</b>: ' + message + '</li><br>');
    socket.emit('chatMessage',to, from, message);
  }

  $("#to").val('').focus();
  $('#m').val('').focus();
    return false;
}

function notifyTyping() { 
  var user = $('#user').val();
  socket.emit('notifyUser', user);
}
// socket.on('chatMessage', function(from, msg){
  
//   var me = $('#user').val();
//   // if(from==me || to==me ){
//   	//console
//   var color = (from == me) ? 'green' : '#009afd';
//   var backgroundcolor=(from == me) ? '#18ffff' : '#4fc3f7';
//   var float=(from==me)? 'right' : 'left';
//   var from = (from == me) ? 'Me' : from;
//   $('#messages').append('<li style="display:block;background:'+backgroundcolor+'; float :'+float+'"><b style="color:' + color + '">' + from + '</b>: ' + msg + '</li><br>');
// // }
// });
socket.on('chatMessage', function(to,from, msg){
  
  var me = $('#user').val();
  var color = (from == me) ? 'green' : '#009afd';
  var backgroundcolor=(from == me) ? '#18ffff' : '#4fc3f7';
  var float=(from==me)? 'right' : 'left';
  var from = (from == me) ? 'Me to'+to : from;
  $('#messages').append('<li style="display:block;background:'+backgroundcolor+'; float :'+float+'"><b style="color:' + color + '">' + from + '</b>: ' + msg + '</li><br>');

});

socket.on('notifyUser', function(user){
  var me = $('#user').val();
  if(user != me) {
    $('#notifyUser').text(user + ' is typing ...');
  }
  setTimeout(function(){ $('#notifyUser').text(''); }, 10000);;
});

$(document).ready(function(){
  // var name = makeid();
 
  var username=window.prompt("please enter name");
  socket.emit("user",username);
   $('#user').val(username);
   document.getElementById('user').innerHTML=username;
 //socket.emit('chatMessage', 'System', '<b>' + username + '</b> has joined the discussion');
});


