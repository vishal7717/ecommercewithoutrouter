const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,

    },
    name:{
        type:String,
        required:true,

    },
    password:{
        type:String,
        required:true,
    },
    isVerified:{
        type:Boolean,
        required:true,
    }
    // profile_pic:{
    //     type:String,
    //     required:true
    // }
},{timestamps:true})

const userModel = mongoose.model('user',userSchema);
module.exports = userModel;