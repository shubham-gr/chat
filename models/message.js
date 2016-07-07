var mongoose=require("mongoose");
var messageSchema= new mongoose.Schema({
userId:String,
message:String,
date:{type:Date,default:Date.now},
room:{type:mongoose.Schema.Types.ObjectId,ref:'Room'}
});
mongoose.model('Message',messageSchema);