// 岗位收藏表
const mongoose = require('mongoose');
const Schema=mongoose.Schema;

const collectSchema=new Schema({
    users:{
        type:Schema.Types.ObjectId,
        ref:'jobs'
    },//用户关联表
    jobs:{
        type:Schema.Types.ObjectId,
        ref:'jobs'
    },//岗位信息，存储岗位ObjectId
    date:{
        type:Date,
        default:Date.now()
    }


})

module.exports=mongoose.model('collects',collectSchema);