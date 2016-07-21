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
mongoose.connect("mongodb://spatwa:spatwa@ds015915.mlab.com:15915/shubham
");
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
var Message=mongoose.model('Message');



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
  if(req.user)
  {
    User.find({},{"username":true,"_id":false},function(err,docs){
      if (err) {
        return next(err);
      }
      console.log(docs);
      return res.render('chatters',{listUser:docs,user:req.user });
    });
  }
  else
  {
    return res.redirect('/');
  }
});


app.param('user1',function(req,res,next,user1){
    req.user1=user1;
    return next();
});

app.param('user2',function(req,res,next,user2)
{
    req.user2=user2;
    return next();
});
app.get('/user1/:user1/user2/:user2',function(req,res,next)
{
  var flag=0;
  Room.find(function(err,docs)
  {
    if(err)
      return next(err);
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
        if (err)
        {
          next(err);
        }
        var ur='/chat/'+docs._id+'/';
        return res.redirect(ur);
      });
    }    
  });
});


app.param('chat',function(req,res,next,chat){
  req.chat=chat;
  return next();
});


app.get('/chat/:chat',function(req,res,next)
{
  if(req.user){
    Message.find({"room":req.chat},function(err,messages)
    {
      if(err)
        return next(err);
      // console.log(JSON.stringify(messages));
      return res.render('chat',{user:req.user,id:req.chat,message:messages});
    }).sort({"date":1})
  }
  else {
    return res.redirect('/');
  }
})


passport.use(new LocalStrategy(function(username, password, done) {
  User.findOne({ username: username }, function(err, user, error) {
    if (err)
     return done(err);
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
    if (err)
     return next(err); 
    if (!user) {
      req.flash('info','sorry information is not correct'); 
      return res.redirect('/')
    }
    req.logIn(user, function(err, info) {
      if (err) 
        return next(err);
      // console.log(JSON.stringify(req.user));
      req.flash('info','Hey '+ user.username +' Logged In Successfully!!');
      return res.redirect('/'); 
    });
  })(req, res, next);
});
app.post('/signup', function(req, res) {
  var user = new User();
  user.username=req.body.username;
  user.email=req.body.email;
  user.password=req.body.password;
  user.save(function(err,docs) {
    req.logIn(user, function(err,success) {
      console.log(req.user);
      req.flash('success','Hello '+ user.username +' Welcome to CareForYou!!');
      return res.redirect('/');
    });
  });
});


app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


var users={};
io.on('connection', function(socket){ 
  

  socket.on("user",function(_id,name){
    console.log("socket",_id);
   users[socket.id]={id:_id,userName:name};
	});
  


  socket.on('chatMessage', function(_id,from,msg){
    var query=Room.findById(_id);
    query.exec(function(err,room){
      if(err)
        return next(err);
      if(!room) 
        return next(new Error('cant found the given room'));
      var message=new Message();
      message.senderName=from;
      message.message=msg;
      message.room=_id;   
      message.save(function(err,message)
      {
        if (err) {return err;}
        console.log(JSON.stringify(message._id));
      });
    });
  	for(var i in users)
  	{
        if (users[i].id==_id) 
        {
          console.log(i," ",users[i]);
          socket.broadcast.to(i).emit('chatMessage',from, msg);
  			}
  		}  
  });


  socket.on('logout',function(){
    for(var i in users)
      if(users[i].userName==users[socket.id].userName)
      {
        console.log("running");
        socket.broadcast.to(i).emit("sessionEnd");
        // delete users[i];
      }
  });
  
  socket.on('disconnect',function(){
    console.log("disconnect",socket.id);
    delete users[socket.id];
    for(var i in users){
      console.log(i," ",users[i]);
    }
  });
  // socket.on('notifyUser', function(){
  //   io.emit('notifyUser', req.user2); 
  // });
});

 http.listen(3000, function(){
  console.log('listening on *:3000');
});
