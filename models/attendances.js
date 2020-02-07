// 考情表
const mongoose = require('mongoose');
const Schema=mongoose.Schema;

const attendanceSchema=new Schema({
    company_users:{
        type:Schema.Types.ObjectId,
        ref:'users'
    },//商家信息,存储用户ObjectId
    employee_users:{
        type:Schema.Types.ObjectId,
        ref:'users'
    },//员工信息,存储用户ObjectId
    jobs:{
        type:Schema.Types.ObjectId,
        ref:'jobs'
    },//岗位信息，存储岗位ObjectId
    attendance_date:{
        type:Date,
        require:true
    },//考勤日期
    workhours:{
        type:String,
        require:true
    },//工作时长
    date:{
        type:Date,
        default:Date.now()
    }


})

module.exports=mongoose.model('attendances',attendanceSchema);