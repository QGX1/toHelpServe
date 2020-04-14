const mongoose = require('mongoose');
const Schema=mongoose.Schema;

const jobSchema=new Schema({
    users:{
        type:Schema.Types.ObjectId,
        ref:'users'
    },//发布者的id,关联用户
    job_post:{
        type:String,
        required:true
    },//岗位名称
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
    // job_time:{
    //     type:String
    // },//到岗时间
    latitude:{
        type:Number,
        required:true
    },//岗位经度
    longitude:{
        type:Number,
        required:true
    },//岗位纬度
    job_descript:{
        type:String
        },//岗位描述，要做什么
    job_skill:{
        type:String
        }
    ,//岗位技能，要会什么
    // job_overdue:{
    //     type:Number,
    //     default:1  //1为默认值不过期，2为过期
    // },
    // 是否过期
    job_timeout:{
        type:String,
        default:"未过期"
    },
    job_nature:{
        type:Boolean,//是否为在校勤工岗
    },
    job_examine:{
        type:String,//管理员是否已审核
        default:"未审核"
    },
    date:{
        type:Date,
        default:Date.now(),
        //  get: v => moment(v).format('YYYY-MM-DD HH:mm:ss')
    }


})

module.exports=mongoose.model('jobs',jobSchema);