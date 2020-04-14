// 分享集合
const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const dynamicSchema=new Schema({
    users:{
        type:Schema.Types.ObjectId,
        ref:'users'
    },
    comments:{
        type:Schema.Types.ObjectId,
        ref:'comments'
    },
    
    likes:{ 
        type:Schema.Types.ObjectId,
        ref:'likes'
    },

    dynamic_text:{
        type:String,
    },
    dynamic_imgs:[
        {
            type:String
        }
    ],
    date:{
        type:Date,
        default:Date.now()
    }
})

module.exports=mongoose.model('dynamics',dynamicSchema)