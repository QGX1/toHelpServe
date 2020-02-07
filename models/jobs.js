const mongoose = require('mongoose');
const Schema=mongoose.Schema;

const jobSchema=new Schema({
    users:{
        type:Schema.Types.ObjectId,
        ref:'users'
    },//发布者的id,关联用户
    // collect:{
    //     type:Schema.Types.ObjectId,
    //     ref:'user'
    // },//关联收藏
    // collect_id:{
    //     type:String,
    // },//收藏表_id
    job_post:{
        type:String,
        required:true
    },//岗位名称
    job_company:{
        type:String,
        required:true
    },//岗位公司名称
    job_salary:{
        type:String,
        required:true
    },//岗位薪资
    job_site:{
        type:String,
        required:true
    },//岗位地址
    job_ask_for:{
        type:String,
        default:'无'
    },//岗位工作经历要求，3年
    job_educat:{
        type:String,
        default:'无'
    },//岗位学历
    job_time:{
        type:String
    },//到岗时间
    lat:{
        type:Number,
        required:true
    },//岗位经度
    lng:{
        type:Number,
        required:true
    },//岗位纬度
    job_descript:[
        {
            type:String
        }
    ],//岗位描述，要做什么
    job_skills:[
        {
            type:String
        }
    ],//岗位技能，要会什么
    job_overdue:{
        type:Number,
        default:1  //1为默认值不过期，2为过期
    },
    date:{
        type:Date,
        default:Date.now()
    }


})

module.exports=mongoose.model('jobs',jobSchema);