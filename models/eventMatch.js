const mongoose =require('mongoose');

const EventMatchSChema=new mongoose.Schema({
    playerId:{
        type:String,
        required:true
    },
    matchId:{
        type:String,
        required:true
    },
    event:{
        type:String,
        required:true
    }
   
});
const EventMatch=mongoose.model("EventMatch",EventMatchSChema);
module.exports=EventMatch;