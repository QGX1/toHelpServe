const express=require('express');
const router =express.Router();
const likes=require('../../models/likes');
const checkToken=require('../../config/checkToken');
const dynamics=require('../../models/dynamics');
const users=require('../../models/users');
/**
 * router POST api/like/addLike
 * desc   新增点赞
 * access private
 */
router.post('/addLike',checkToken,(req,res)=>{
    if(req.body.users!=req.user._id){ return res.status(401).json({status:0,msg:'用户未登陆'});}
    likes.findOne({dynamic_id:req.body.dynamic_id})//判断该评论是否存在点赞
    .then(result=>{
        if(result){
            let userIsLike=result.like_list.filter(item=>{
                return (item.users==req.body.users);
            })
            if(userIsLike.length>0){
                return res.json({code:1,msg:'不能重复点赞'})
            }else{
                // 该用户没有点过赞
                let newLike={users:req.body.users}
                result.like_list.push(newLike);
                result.save().then(result1=>{
                    return res.json({code:0,msg:result1})
                }) 
            }
        }
        else{
            // 不存在
            console.log(222333,req.body.users)
            likes.create({dynamic_id:req.body.dynamic_id,like_list:{users:req.body.users}})
            .then(result=>{
                dynamics.update({_id:req.body.dynamic_id},{$set:{likes:result._id}})
                .then(result=>{
                    if(!result) return res.json({code:1,msg:'未完成'})
                    // result.populate('users').exec(function(err,docs){
                    //     console.log(555,docs)
                    // })
                    return res.json({code:0,msg:result})
                }) 
            })
        }
    })
})
/**
 * router DETE api/like/deteLike
 * desc   删除点赞
 * access private
 */
router.delete('/deleteLike',checkToken,(req,res)=>{
    if(req.body.users!=req.user._id){ return res.status(401).json({status:0,msg:'用户未登陆'});}   
    likes.update({dynamic_id:req.body.dynamic_id},{'$pull':{like_list:{users:req.body.users}}}).then(result=>{
        console.log(result)
        return res.json({code:0,msg:'完成'});
    })
    .catch(err=>{return res.json({code:0,msg:err})})
})
module.exports=router;