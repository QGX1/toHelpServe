// 消息集合
const mongoose=require('mongoose');
const Schema= mongoose.Schema;//数据模型

const inforSchema=new Schema({
    users:{
        type:Schema.Types.ObjectId,
        ref:'users'//外键关联,与用户表关联
    },
    infor_count:{//消息发起人的未读消息总数
        type:Number,
    },
    infor_count2:{//消息接收人的未读消息总数
        type:Number,
    },
    user_id:{
        type:String,
        required:true
    },//当前用户id
    infor_message:[//消息
        {
            infor_source:{//消息来源
                type:String,
                required:true
            },
            infor_msg:{//消息内容
                type:String,
                required:true
            }
        }
    ],
    target_users:{//消息目标
        type:Schema.Types.ObjectId,
        ref:'users'//外键关联,与用户表关联
    },
    date:{
        type:Date,
        default:Date.now
    }
})

module.exports=mongoose.model('infors',inforSchema);