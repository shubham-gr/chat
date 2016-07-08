var mongoose=require("mongoose");

var roomSchema= new mongoose.Schema({
	user1:String,
	user2:String,
	date:{type:Date,default:Date.now},
	// messages:[{type:mongoose.Schema.Types.ObjectId,ref:'Message'}]
});

mongoose.model('Room',roomSchema);
