// 收藏数据表的操作
const express = require('express');
const router = express.Router();
const db = require('../../config/db');//引入数据库
const checkToken = require('../../config/checkToken');//验证token的配置
const complaints = require('../../models/complaints');
const QS = require('qs');
/**
 * router /api/complaint/addComplaint
 * desc   新增举报
 * access private
 */
router.post('/addComplaint', checkToken, (req, res) => {
    if (req.body.users != req.user._id) { return res.status(401).json({ code: 0, msg: '用户未登陆' }); }
    // 同一个商家同一个人有两个岗位
    console.log('投诉', req.body)
    req.body = QS.parse(req.body);//将字符串转变成数组
    let newComplaints = new complaints({
        users: req.body.users,
        targets: req.body.targets,
        complaint_text: req.body.complaint_text,
        complaint_imgs: req.body.complaint_imgs
    });
    newComplaints.save().then(result => {
        console.log(result);
        if (result.length <= 0) return res.json({ code: 1, msg: '投诉失败' })
        return res.json({ code: 0, msg: '投诉成功' })
    })

})


/**
 * router  api/complaint/getComplaint
 * desc    查看所有投诉
 * access  peivate
 */
router.get('/getComplaint', checkToken, (req, res) => {
    let value = JSON.parse(req.query.value);
    if (value.users != req.user._id) { return res.status(401).json({ code: 0, msg: '用户未登陆' }); }
    if (value.user_limit == 3) {
        complaints.find().sort({ _id: -1 })
            .populate('users')
            .populate('targets').then(complaint => {
                if (complaint.length > 0) res.json({ code: 0, msg: complaint });
                res.json({ code: 1, msg: '暂无数据' })
            })
    }else{
        return res.status(404);
    }

})
/**
 * router  api/complaint/updataComplaint
 * desc    修改状态
 * access  peivate
 */
router.put('/updataComplaint', checkToken, (req, res) => {
    if (req.body.users != req.user._id) { return res.status(401).json({ code: 0, msg: '用户未登陆' }); }
    if(req.body.user_limit==3){
        complaints.update({ _id: req.body._id },{$set:{adminstHandel:req.body.adminstHandel}}).then(complaint => {
            if (complaint) return res.json({ code: 0, msg: '已更新' })
            return res.json({ code: 1, msg: '更新失败，请重新操作' })
        })
    }
})

module.exports = router;