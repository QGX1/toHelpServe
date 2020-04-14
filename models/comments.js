// 评论集合
const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const commentSchema=new Schema({
    dynamic_id:{
        type:String,
        required:true
    },//动态表_id[虽然关联了动态表，但是也要存]
    comment_list:[
        {
            comment_text:{
                type:String,
                required:true
            },//评论或回复的内容
            user_id:{
                type:String,
                required:true
            },//评论或回复人的_id
            user_name:{
                type:String,
                required:true
            },//评论或回复者的name
            comment_reply_id:{
                type:String,
            },//评论或回复的_id
            comment_reply_name:{
                type:String
            }//被回复人的名字
        }
    ],
    date:{
        type:Date,
        default:Date.now()
    }
})

module.exports=mongoose.model('comments',commentSchema)