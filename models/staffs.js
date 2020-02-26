// 员工表
const mongoose=require('mongoose');
const Schema=mongoose.Schema;
const staffSchema=new Schema({
    // 外键，用户表
    users:{
        type:Schema.Types.ObjectId,
        ref:'users'
    },
    //员工姓名
    staff_name: {
        type:String,
        required:true
    },
    //员工邮箱
    staff_email: {
        type:String,
        required:true
    },
    //员工手机号码
    staff_phone: {
        type:String,
        required:true
    },
    //员工手机号码
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
        type:String,
        required:true
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