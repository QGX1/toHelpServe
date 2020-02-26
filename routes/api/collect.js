// 收藏数据表的操作
const express = require('express');
const router = express.Router();
const db = require('../../config/db');//引入数据库
const checkToken = require('../../config/checkToken');//验证token的配置
const collects = require('../../models/collects');

/**
 * router /api/collect/addCollect
 * desc   新增收藏
 * access private
 */
router.post('/addCollect', checkToken, (req, res) => {
    console.log(111, req.body)
    if (req.body.users != req.user._id) { return res.status(401).json({ code: 0, msg: '用户未登陆' }); }
    // 同一个商家同一个人有两个岗位
    let newCollect = new collects({
        users: req.body.users,
        jobs: req.body._id
    });
    newCollect.save().then(result => {
        console.log(result);
        if (result.length <= 0) return res.json({ code: 1, msg: '收藏失败' })
        return res.json({ code: 0, msg: '收藏成功' })
    })

})
/**
 * router  /api/collect/:user_id
 * desc    当前用户是否收藏
 * access  private
 */
router.get('/', checkToken, (req, res) => {
    console.log(req.query);
    if (req.query.users != req.user._id) { return res.status(401).json({ code: 0, msg: '用户未登陆' }); }
    collects.find({ users: req.query.users,jobs:req.query._id })
        .then(collect => {
            console.log(collect);
            if (collect.length <= 0) return res.json({ code: 1, msg: '无数据' })
            return res.json({ code: 0, msg: '存在' });
        })
})
/**
 * router  /api/collect/allCollect/:user_id
 * desc    我的收藏
 * access  private
 */
router.get('/allCollect/:user_id', checkToken, (req, res) => {
    console.log(req.params);
    if (req.params.user_id != req.user._id) { return res.status(401).json({ code: 0, msg: '用户未登陆' }); }
    collects.find({ users: req.params.user_id }).sort({ _id: -1 })
        .populate('users')
        // 二级联表查询
        .populate({
            path: 'jobs',
            populate: {
                path: 'users'
            }
        })
        .then(collect => {
            if (collect.length <= 0) return res.json({ code: 1, msg: '无数据' })
            return res.json({ code: 0, msg: collect });
        })
})

/**
 * router  api/collect/deleteCollect
 * desc    取消收藏
 * access  peivate
 */
router.delete('/deleteCollect', checkToken, (req, res) => {
    console.log(req.body)
    if (req.body.users != req.user._id) { return res.status(401).json({ code: 0, msg: '用户未登陆' }); }
    collects.remove({ _id: req.body._id }).then(collect => {
        // console.log(staff)
        if (collect) return res.json({ code: 0, msg: '已删除' })
        return res.json({ code: 1, msg: '删除失败，请重新操作' })
    })
})
/**
 * router  api/collect/deleteCollect
 * desc    取消收藏
 * access  peivate
 */
router.delete('/deleteCollect2', checkToken, (req, res) => {
    console.log(req.body)
    if (req.body.users != req.user._id) { return res.status(401).json({ code: 0, msg: '用户未登陆' }); }
    collects.remove({ jobs: req.body._id,users:req.body.users }).then(collect => {
        // console.log(staff)
        if (collect) return res.json({ code: 0, msg: '已删除' })
        return res.json({ code: 1, msg: '删除失败，请重新操作' })
    })
})
module.exports = router;