const express=require('express');
const router=express.Router();
const db=require('../../config/db');//引入数据库
const checkToken=require('../../config/checkToken');//验证token的配置
const infors=require('../../models/infors');
const Qs=require('qs');
const mongoose=require('mongoose')
/**
 * router POST api/infor/addInfo
 * desc   添加消息记录
 * access Private
 */
//当前用户=》目标用户
router.post('/addInfor',checkToken,(req,res)=>{
    let inforField={}
    //1、判断目标用户是否存在
    // console.log(req.body.infor_target._id)
    
    req.body=Qs.parse(req.body);
    //console.log(8888,req.body)
    infors.findOne({
        $and:[
             {$or:[{'target_users':req.body.target_users},{"target_users":req.body.user_id}]},
             {$or:[{"user_id":req.body.user_id},{"user_id":req.body.target_users}]}
            ] 
        })
        .then(result=>{
            //console.log(result);
            // 不存在该关系用户
            if(!result){
                if(req.body.target_users) inforField.target_users=req.body.target_users;
                if(req.body.user_id) {
                    inforField.user_id=req.body.user_id;
                    inforField.users=req.body.user_id;
                };
                if(req.body.infor_message) inforField.infor_message=req.body.infor_message;
                inforField.infor_count=req.body.infor_count;
                inforField.infor_count2=req.body.infor_count2;
                new infors(inforField).save().then(result=>res.json({code:0,msg:result}))

            }else{
                // 存在该关系用户
                result.infor_message.push(req.body.infor_message);
                result.infor_count=req.body.infor_count;
                result.infor_count2=req.body.infor_count2;
                result.save().then(result=>{
                    res.json({code:0,msg:result});
                })
            }

        })
})
/**
 * router GET api/infor/msg/:user:id
 * desc   获取用户的所有消息记录
 * access private
*/
router.get('/msg/:user_id',checkToken,(req,res)=>{
    console.log(3333,req.params,req.user._id)
    if(req.params.user_id!=req.user._id){ return res.status(401).json({status:0,msg:'用户未登陆'});}
    // console.log(99,req.params.user_id)
    // console.log(req.params)
    infors.find()
        .populate('users')
        .populate('target_users')
        .then(result=>{
            console.log('消息',result.length)
            if(result.length<=0) return res.json({code:0,msg:'没有任何消息'})
            // 过滤数据，与对应的id的值
            let msgObj=result.filter((item,index,result)=>{
                // console.log(222,item.target_users._id)
                // console.log(333,req.params.user_id)
                // console.log(444,item.target_users._id)
                return (item.user_id==req.params.user_id)||(item.target_users._id==req.params.user_id);
            })
            //console.log(1888,msgObj)
            return res.json({code:0,msg:msgObj})
        })
})
/**
 * router PUT api/infor/updateMsg
 * desc   修改未读消息未0
 * access private
*/
router.put('/updateMsg',checkToken,(req,res)=>{
    if(req.body.user_id!=req.user._id){ return res.status(401).json({status:0,msg:'用户未登陆'});}
    //console.log('555',req.body);
    infors.update({_id:req.body.infor_id},{$set:{
        infor_count:req.body.infor_count,
        infor_count2:req.body.infor_count2
    }}).then(result=>{
        //console.log('111',result)
        res.json({code:0,msg:'完成'})
    })

})
module.exports=router;