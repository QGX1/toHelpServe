// 岗位表
const mongoose = require('mongoose');
const Schema=mongoose.Schema;

const employeeSchema=new Schema({
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
    induction_data:{
        type:Date
    },//入职日期
    departure_date:{
        type:Date
    },
    date:{
        type:Date,
        default:Date.now()
    }


})

module.exports=mongoose.model('employees',employeeSchema);