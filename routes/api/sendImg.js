const express=require('express');
const router=express.Router();
const checkToken=require('../../config/checkToken');
const fs= require("fs")
const multer  = require('multer')
//获取时间
function getNowFormatDate() {
    let date = new Date();//获取时间
    let seperator1 = "-";
    let month = date.getMonth() + 1;//获取月份
    let strDate = date.getDate();//获取日
    let h = date.getHours(); //获取当前小时数(0-23)
    let m = date.getMinutes(); //获取当前分钟数(0-59)
    let s = date.getSeconds();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    let currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate+Math.floor(Math.random()*(h+m+s));
    return currentdate.toString();
}
let datatime = 'public/images/picture';
//将图片放到服务器
let storage = multer.diskStorage({
    // 保存路径
    destination: datatime,
    //给上传文件重命名，获取添加后缀名
    filename: function (req, file, cb) {
        cb(null,  file.originalname+'-'+getNowFormatDate);
     }
}); 
// 通过storage 选项来对上传行为进定制化
var upload = multer({
    storage: storage
});
/**
 * Router api/public/sendImg
 * desc   上传图片
 * access private
 */
router.post('/uploadImg',checkToken,(req,res)=>{
    // console.log(111,req.body.Base64Str)
    var Base64Str = req.body.Base64Str;
    let dataTime=getNowFormatDate();
    //过滤data:URL
    var dataBuffer = new Buffer(Base64Str, 'base64');
    //console.log(111,req.body.Base64Str)
    let imgSrc=`public/images/picture/${dataTime}.jpg`;//图片存放地址
    let imgSrc1=`${dataTime}.jpg`;//返回图片名给用户
    fs.writeFile(imgSrc, dataBuffer, function(err) {
    if(err){
            res.json({code:1,msg:'图片过大无法上传',err});
        }else{
            res.json({msg:"保存成功！",code:0,imgSrc:imgSrc1});
        }
    });

})

module.exports=router;
