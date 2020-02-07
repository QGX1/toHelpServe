const express=require('express');
const router=express.Router();
const dynamics=require('../../models/dynamics');
const checkToken=require('../../config/checkToken');
const likes=require('../../models/likes');
const comments=require('../../models/comments');
const QS = require('qs');
const mongoose=require('mongoose');
/**
 * router POST api/dynamic/addDynamic
 * desc   新增动态
 * access private
 */
 router.post('/addDynamic',checkToken,(req,res)=>{
    // console.log(req.body);
     req.body=QS.parse(req.body)
    if(req.body.user_id!=req.user._id){ return res.status(401).json({status:0,msg:'用户未登陆'});}
    let newDynamic=new dynamics({
        // user_id:req.body.user_id,
        dynamic_text:req.body.dynamic_text,
        dynamic_imgs:req.body.dynamic_imgs,
        users:req.body.user_id//与用户表关联，在数据库中字符串变成objectId
    })
    newDynamic.save().then(result=>{
        if(!result) return res.status(404).json({code:1,msg:'请重新输入'})
        res.json({code:0,msg:'完成'})
    })
 });

 /**
 * router DELETE api/dynamic/deleteDynamic
 * desc   删除动态,联表删除【点赞表、评论表】
 * access private
 */
router.delete('/deleteDynamic',checkToken,(req,res)=>{
    console.log(req.body)
    if(req.body.user_id!=req.user._id){ return res.status(401).json({code:0,msg:'用户未登陆'});}
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
    //假设传过来的数据有limit(限制条数)、preNum(当前所在页from)、nextNum(要去的页to)、_id(当前页最后一个id)
    // 该分页处理是通过当前页数据的最后一个或_id字段到服务器比较objectId大小进行分页
    // if(req.body.user_id!=req.user._id){ return res.status(401).json({code:1,msg:'用户未登陆'});}
    req.query=JSON.parse(req.query.value);//将字符串变成json数据
    //console.log(111,req.query)
    let nextNum=req.query.nextNum;
    let preNum=req.query.preNum; 
    let countNum=0;
        limitNum=parseInt('10');
        _id=req.query._id;
        // req.query._id;
    let query;
    let skips=null;
    // 有数据跳过的情况
    if(nextNum-preNum>0){
        skips=(nextNum-preNum-1)*limitNum;//向后更新数据、有跳过数据
    }else{
        skips=(preNum-nextNum-1)*limitNum;//向前更新数据、有跳过数据【没有跳过数据则为0】
    };
    // 查询动态一共有多少条数据
    dynamics.count(function(err,count){
        return err?false:countNum=count;
    });
    // 如果前端有传最后一条数据的_id；证明不是初始化数据
    if(_id){
        //console.log(9900)
        let id=mongoose.Types.ObjectId(_id)
       // console.log(444,id)
        if(nextNum-preNum>0){
            query=dynamics.find({'_id':{"$lt":id}});
        }else{
            query=dynamics.find({'_id':{"$gt":id}});
        }
        // console.log(133,dynamics.find({"_id":{"$lt":id}}))
    }else{
        query=dynamics.find();
    }

    // 数据查询
    if(nextNum-preNum>0){
        query.sort({'_id':-1})
    }else{
        query.sort({'_id':1})
    }
    // console.log(888,query)
    query.skip(skips).limit(limitNum)
        .populate('users')//关联表查询
        .populate('comments')
        .populate({
            path:'likes',
            populate:{
                path:'like_list.users',
                select:'user_name _id'
            }
        })
        .exec(function(err,docs){
          //  console.log(222,docs)
            if(err) throw err;
            if(nextNum-preNum<0){
                docs.sort(function(a,b){
                    return b._id.getTimestamp()-a._id.getTimestamp();
                })
            }
            res.json({code:0,msg:docs,count:countNum})
        })
        // .then(result=>{
        //     if(!result) return res.json({code:1,msg:'没有任何动态'})
        //     console.log(result)
        //     return res.json({code:1,msg:result})
        // })
 });
 /**
 * router GET api/dynamic/getDynamic/:user_id
 * desc   查看个人动态【联表查询，点赞、评论】
 * access private
 */
router.get('/getDynamic/:user_id',checkToken,(req,res)=>{
    if(req.params.user_id!=req.user._id){ return res.status(401).json({code:0,msg:'用户未登陆'});}
    // dynamics.find({users:req.params.user_id})
    // .populate('users')//关联表查询
    // .populate('comments')
    // .populate('likes')
    // .then(result=>{
    //     if(result.length===0) return res.json({code:1,msg:'没有任何动态'})
    //     return res.json({code:1,msg:result})
    // })
    req.query=JSON.parse(req.query.value);//将字符串变成json数据
    //console.log(111,req.query)
    let nextNum=req.query.nextNum;
    let preNum=req.query.preNum; 
    let countNum=0;
        limitNum=parseInt('10');
        _id=req.query._id;
        // req.query._id;
    let query;
    let skips=null;
    // 有数据跳过的情况
    if(nextNum-preNum>0){
        skips=(nextNum-preNum-1)*limitNum;//向后更新数据、有跳过数据
    }else{
        skips=(preNum-nextNum-1)*limitNum;//向前更新数据、有跳过数据【没有跳过数据则为0】
    };
    // 查询动态一共有多少条数据
    dynamics.find({users:req.params.user_id}).count(function(err,count){
        return err?false:countNum=count;
    });
    // 如果前端有传最后一条数据的_id；证明不是初始化数据
    if(_id){
        let id=mongoose.Types.ObjectId(_id)
        if(nextNum-preNum>0){
            query=dynamics.find({'_id':{"$lt":id},users:req.params.user_id});
        }else{
            query=dynamics.find({'_id':{"$gt":id},users:req.params.user_id});
        }
    }else{
        query=dynamics.find({users:req.params.user_id});
    }
    // 数据查询
    if(nextNum-preNum>0){
        query.sort({'_id':-1})
    }else{
        query.sort({'_id':1})
    }
    query.skip(skips).limit(limitNum)
        .populate('users')//关联表查询
        .populate('comments')
        .populate({
            path:'likes',
            populate:{
                path:'like_list.users',
                select:'user_name _id'
            }
        })
        .exec(function(err,docs){
            if(err) throw err;
            if(nextNum-preNum<0){
                docs.sort(function(a,b){
                    return b._id.getTimestamp()-a._id.getTimestamp();
                })
            }
            res.json({code:0,msg:docs,count:countNum})
        })
 });
module.exports=router;