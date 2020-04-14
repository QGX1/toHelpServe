// 点赞集合
const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const likeSchema=new Schema({
    dynamic_id:{
        type:String,
        required:true
    },//动态表_id
    like_list:[{
        users:{
            type:Schema.Types.ObjectId,
            ref:'users'
        },//与users表关联
    }],
    date:{
        type:Date,
        default:Date.now()
    }
})

module.exports=mongoose.model('likes',likeSchema)