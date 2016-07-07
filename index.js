var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var express=require('express');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var flash = require('express-flash');
var bodyParser = require('body-parser');
var session = require('express-session');
var nodemailer = require('nodemailer');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt-nodejs');
var async = require('async');
var crypto = require('crypto');
var mongoose=require("mongoose");
mongoose.connect("mongodb://localhost/chat");
require('./models/user');
require('./models/list');
require('./models/room');
require('./models/message');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({ secret: 'shsh' }));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
var List=mongoose.model('List');
var User=mongoose.model('User');
var Room=mongoose.model('Room');



app.get('/', function(req, res){ 
res.render('index',{user:req.user});
});
 app.get('/signup',function(req,res){
  if(!req.user)
    res.render('signup');
  else
    res.redirect('/');
 });
 app.get('/login',function(req,res){
  if(!req.user)
    res.render('login');
  else
    res.redirect('/');
 });
app.get('/chatters',function(req,res,next){
  List.find(function(err,docs){
    if (err) {
      return next(err);
    }
    res.render('chatters',{listUser:docs,user:req.user });
  });
})
app.param('user1',function(req,res,next,user1){
    req.user1=user1;
    return next();
  });

app.param('user2',function(req,res,next,user2){
    req.user2=user2;
    return next();
  });
app.get('/user1/:user1/user2/:user2',function(req,res,next){
var flag=0;
 Room.find(function(err,docs){
    if(err)return next(err);
    for(var i=0;i<docs.length;i++)
    {
        if((docs[i].user1==req.user1 || docs[i].user1==req.user2 )&& (docs[i].user2==req.user1 || docs[i].user2==req.user2))
        {
            flag=1;
            var ur='/chat/'+docs[i]._id+'/';
            return res.redirect(ur);
        }
    }
    if(!flag)
    {
      var room=new Room();
      room.user1=req.user1;
      room.user2=req.user2;
      room.save(function(err,docs)
      {
        if (err) {next(err);}
      console.log(JSON.stringify(docs));
            var ur='/chat/'+docs._id+'/';
            return res.redirect(ur);
      });
      
      // return res.redirect('/chat/'+docs._id+'/');
    }    
  });
});
app.param('chat',function(req,res,next,chat){
  req.chat=chat;
  return next();
});
app.get('/chat/:chat',function(req,res,next){
  res.render('chat',{user:req.user,id:req.chat});
})

 passport.use(new LocalStrategy(function(username, password, done) {
  User.findOne({ username: username }, function(err, user, error) {
    if (err) return done(err);
    if (!user){
      //req.flash('error','sorry incorrect username ');
      return done(null, false, { messages: 'Incorrect username.' });
    }
    user.comparePassword(password, function(err, isMatch, error) {
      if (isMatch) {
        return done(null, user);
      } else {
        //req.flash('error','sorry incorrect password ');
        return done(null, false, { messages: 'Incorrect password.' });
      }
    });
  });

}));
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

app.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err,user, info) {
    if (err) return next(err); 
    if (!user) {
      req.flash('info','sorry information is not correct'); 
      return res.redirect('/')
    }
    req.logIn(user, function(err, info) {
      if (err) return next(err);
      console.log(JSON.stringify(req.user));
      req.flash('info','Hey '+ user.username +' Logged In Successfully!!');
      return res.redirect('/'); 
    });
  })(req, res, next);
});
app.post('/signup', function(req, res) {
  var user = new User();
  var list=new List();
  list.username=req.body.username;
  user.username=req.body.username;user.email=req.body.email;user.password=req.body.password;
  user.save(function(err,docs) {
    console.log(JSON.stringify(docs));
    list.save(function(err){
    req.logIn(user, function(err,success) {
      console.log(req.user);
      req.flash('success','Hello '+ user.username +' Welcome to CareForYou!!');
      return res.redirect('/');
    });
  });
  });
});
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});
 var users={};
io.on('connection', function(socket){ 
	socket.on("user",function(_id){
    //console.log(JSON.stringify(req.user1));
    console.log("socket",_id);
    if(_id in users)
		  users[_id].push(socket.id);
    else
		  users[_id]=[socket.id];
    // console.log(JSON.stringify(users[_id]));
	  console.log(users[_id]);	
		// socket.emit('chatMessage', 'System', '<b>' + username + '</b> has joined the discussion');
	});

  // socket.on('chatMessage', function(from, msg){
  //   io.emit('chatMessage', from, msg);
  // });
  socket.on('chatMessage', function(_id,from,msg){
  	// var id="",selfid="";
    console.log(from);
  	for(var i=0;i<users[_id].length;i++)
  	{

        // console.log("to", users[i].user_name );
        console.log(users[_id][i]);
        socket.broadcast.to(users[_id][i]).emit('chatMessage',from, msg);
  			// console.log("found");
  			// break;
  		}
  		// if(users[i].user_name==req.user1)
  		// {
    //     console.log("from");
  		// 	selfSocketId = users[i].id;
    //     console.log(users, '>>>>>>Users')
    //     socket.broadcast.to(selfSocketId).emit('chatMessage',to,from, msg);
  		// 	// console.log("found");
  		// 	// break;	
  		// }
  	// }
    // socket.broadcast.to(id).emit('chatMessage',to,from, msg);
    //socket.broadcast.to(selfid).emit('chatMessage',to,from, msg);
  
  });
  
// socket.on('notifyUser', function(){
//     io.emit('notifyUser', req.user2); 
//   });
});

 http.listen(3000, function(){
  console.log('listening on *:3000');
});
