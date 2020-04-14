// 投诉集合
const mongoose = require('mongoose');
const Schema=mongoose.Schema;

const complaintSchema=new Schema({
    users:{
        type:Schema.Types.ObjectId,
        ref:'users'
    },//用户关联表
    targets:{
        type:Schema.Types.ObjectId,
        ref:'users'
    },//目标用户
    // 标记管理员是否处理该举报
    adminstHandel:{
        type:Number,
        default:0,
    },
    complaint_imgs:[
        {type:String}
    ],
    complaint_text:{
        type:String
    },
    date:{
        type:Date,
        default:Date.now()
    }
})

module.exports=mongoose.model('complaints',complaintSchema);