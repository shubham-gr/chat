var mongoose=require("mongoose");
var listSchema= new mongoose.Schema({
	 username:{type:String ,require:true,unique:true},
});
mongoose.model('List',listSchema);