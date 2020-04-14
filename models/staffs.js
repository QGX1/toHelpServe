// 员工集合
const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const staffSchema=new Schema({
    // 外键，用户表
    users:{
        type:Schema.Types.ObjectId,
        ref:'users'
    },
    //员工岗位
    staff_position: {
        type:String,
        required:true
    },
    //员工入职时间
    staff_time: {
        type:String,
        required:true
    },
    //员工的id
    staff_id:{
        type:Schema.Types.ObjectId,
        ref:'users'
    },
    // 是否离职
    staff_quit:{
        type:Boolean,
        default:false
    },
    date:{
        type:Date,
        default:Date.now()
    }
   
})
module.exports=mongoose.model('staffs',staffSchema)