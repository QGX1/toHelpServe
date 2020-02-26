// 考勤表
const mongoose = require('mongoose');
const Schema=mongoose.Schema;

const attendanceSchema=new Schema({
    users:{
        type:Schema.Types.ObjectId,
        ref:'users'
    },//商家信息,存储用户ObjectId
    staffs:{
        type:Schema.Types.ObjectId,
        ref:'staffs'
    },//员工信息,存储用户ObjectId(考勤表与员工表关联)
    work_hours:{
        type:Number,
        required:true
    },//考勤工时
    work_time:{
        type:String,
        require:true
    },//考勤日期
    date:{
        type:Date,
        default:Date.now()
    }
})

module.exports=mongoose.model('attendances',attendanceSchema);