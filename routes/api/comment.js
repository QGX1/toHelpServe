const express=require('express');
const router=express.Router();
const comments=require('../../models/comments');
const checkToken=require('../../config/checkToken');
const dynamics=require('../../models/dynamics');
const QS = require('qs')
/**
 * router POST api/comment/addComment
 * desc   新增评论
 * access private
 */
router.post('/addComment',checkToken,(req,res)=>{
    // 判断当前用户是否和要进行操作的用户信息相同
    console.log(666)
    console.log(QS.parse(req.body))
    req.body=QS.parse(req.body)
    if(req.body.comment_list.user_id!=req.user._id){ return res.status(401).json({status:0,msg:'用户未登陆'});}
    // 判断当前动态是否已存在数据库中
    let commentFile={}
    comments.findOne({dynamic_id:req.body.dynamic_id})
        .then(comment=>{
            //该动态不存在评论，关联动态表存入数据库中
            if(!comment){
                commentFile.dynamic_id=req.body.dynamic_id;
                commentFile.comment_list=req.body.comment_list;
                new comments(commentFile).save((err,commentFile)=>{
                    if(err) throw err
                    dynamics.update({_id:req.body.dynamic_id},
                        {$set:{comments:commentFile._id}}).then(result=>{
                            return res.json({code:1,msg:'完成'})
                        })
                })
            }
            comment.comment_list.push(req.body.comment_list);
            comment.save().then(result=>{
                if(result.length<=0) res.status(404).json({code:0,msg:'未完成'});
                res.json({code:1,msg:'完成'})
            })
        })
});
/**
 * router DELETE api/comment/deletComment
 * desc   删除评论
 * access private
 */
router.delete('/deleteComment',checkToken,(req,res)=>{
    if(req.body.user_id!=req.user._id){ return res.status(401).json({status:0,msg:'用户未登陆'});}
    comments.update({_id:req.body.comment_id},{"$pull":{comment_list:{_id:req.body.comment_list_id}}}).then(result=>{
        return res.json({code:1,msg:'完成'});
    })
    .catch(err=>{return res.json({code:0,msg:err})})

})

module.exports=router;
