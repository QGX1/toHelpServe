// 用户表
const mongoose=require('mongoose');
const Schema= mongoose.Schema;

// create Schema
const userSchema =new Schema({
    user_name:{
        type:String,
        required:true
    },
    user_email:{
        type:String,
        required:true,
        unique: true
    },
    user_password:{
        type:String,
        required:true
    },
    user_avatar:{
        type:String,
        default:'https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=1620038707,2392030161&fm=26&gp=0.jpg'
    },
    user_phone:{
        type:String,
        required:true,
    },
    // 用户权限【1为普通用户、2为商家】
    user_limit:{
        type:Number,
        required:true,
        default:1
    },
    // 商家公司-职位【例如：阿里巴巴CEO】
    user_company_position:{
        type:String
    },
    user_incumbency:{
        type:Number,
        default:1
    },//用户的在职状态【1随时到岗，2在职】
    date: {
        type: Date,
        default: Date.now()
    }
})

module.exports=mongoose.model('users',userSchema);