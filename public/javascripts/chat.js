var socket = io(); 
// var from="";
function submitfunction(){
  var from = document.getElementById('user').innerHTML;
  console.log(from);
  var message = $('#m').val();
  var id=$('#id').val();
  // var to=$('#to').val();
  if(message != '' ) {
    console.log("msg");
    $('#messages').append('<li style="display:block;background:#18ffff; float :right"><b style="color:green">' + "Me"+ '</b>: ' + message + '</li><br>');
    socket.emit('chatMessage', id, from, message);
  }

  $("#to").val('').focus();
  $('#m').val('').focus();
    return false;
}

function notifyTyping() { 
  // var user = $('#user').val();
  socket.emit('notifyUser');
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
socket.on('chatMessage', function(from, msg){
  var me = document.getElementById('user').innerHTML;
  // var me = $('#user').val();
  console.log(me,from);
  var color = (from == me) ? 'green' : '#009afd';
  var backgroundcolor=(from == me) ? '#18ffff' : '#4fc3f7';
  var float=(from==me)? 'right' : 'left';
  var from = (from == me) ? 'Me' : from;
  $('#messages').append('<li style="display:block;background:'+backgroundcolor+'; float :'+float+'"><b style="color:' + color + '">' + from + '</b>: ' + msg + '</li><br>');

});

socket.on('notifyUser', function(user){
  // var me = $('#user').val();
  // if(user) {
    $('#notifyUser').text(user + ' is typing ...');
  }
  // setTimeout(function(){ $('#notifyUser').text(''); }, 10000);
);

$(document).ready(function(){
   // var name = <%= id %>;
   // console.log(name);
 // alert( );
 var id=$("#id").val();
 // from=("#user").val();

 console.log(id);
  // var username=window.prompt("please enter name");
  socket.emit("user",id);
  //  $('#user').val(username);
  //  document.getElementById('user').innerHTML=username;
 //socket.emit('chatMessage', 'System', '<b>' + username + '</b> has joined the discussion');
});


