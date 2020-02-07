const express=require('express');
const router=express.Router();
const jobs=require('../../models/jobs');
const checkToken=require('../../config/checkToken');
/**
 * router POST api/job/addJob
 * desc   新增工作岗位
 * access private
 */
 router.post('/addJob',checkToken,(req,res)=>{
    //  console.log(req.body);
    if(req.body.user_id!=req.user._id){ return res.status(401).json({code:0,msg:'用户未登陆'});}
    let newJob=new jobs({
        job_post,
        job_company,
        users:req.body.user_id//与用户表关联，在数据库中字符串变成objectId
    })
    newJob.save().then(result=>{
        if(!result) return res.json({code:0,msg:'请重新输入'})
        res.json({code:1,msg:'完成'})
    })
 });

 /**
 * router DELETE api/dynamic/deleteDynamic
 * desc   删除动态,联表删除【点赞表、评论表】
 * access private
 */
router.delete('/deleteDynamic',checkToken,(req,res)=>{
    if(req.body.user_id!=req.user._id){ return res.status(401).json({status:0,msg:'用户未登陆'});}
        comments.remove({dynamic_id:req.body.dynamic_id})
        likes.remove({dynamic_id:req.body.dynamic_id})
        .then(result=>{
            dynamics.remove({_id:req.body.dynamic_id})
            .then(result=>{
                if(!result) return res.json({code:0,msg:'出错'})
                return res.json({code:1,msg:'已删除'})
            })
        })
 });
 /**
 * router GET api/dynamic/getDynamic
 * desc   查看所有动态【联表查询，点赞、评论】
 * access public
 */
router.get('/getDynamic',checkToken,(req,res)=>{
    if(req.body.user_id!=req.user._id){ return res.status(401).json({status:0,msg:'用户未登陆'});}
    dynamics.find()
        .populate('users')//关联表查询
        .populate('comments')
        .populate('likes')
        .then(result=>{
            if(!result) return res.json({code:1,msg:'没有任何动态'})
            return res.json({code:1,msg:result})
        })
 });
 /**
 * router GET api/dynamic/getDynamic/:user_id
 * desc   查看个人动态【联表查询，点赞、评论】
 * access private
 */
router.get('/getDynamic/:user_id',checkToken,(req,res)=>{
    if(req.params.user_id!=req.user._id){ return res.status(401).json({code:0,msg:'用户未登陆'});}
    dynamics.find({users:req.params.user_id})
    .populate('users')//关联表查询
    .populate('comments')
    .populate('likes')
    .then(result=>{
        if(result.length===0) return res.json({code:1,msg:'没有任何动态'})
        return res.json({code:1,msg:result})
    })
 });
module.exports=router;