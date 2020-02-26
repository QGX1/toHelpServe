// 员工数据表的操作
const express = require('express');
const router = express.Router();
const db = require('../../config/db');//引入数据库
const checkToken = require('../../config/checkToken');//验证token的配置
const staffs = require('../../models/staffs');

/**
 * router /api/staff/addStaff
 * desc   新增员工
 * access private
 */
router.post('/addStaff', checkToken, (req, res) => {
    console.log(req.body)
    if (req.body.users != req.user._id) { return res.status(401).json({ code: 0, msg: '用户未登陆' }); }
    // 同一个商家同一个人有两个岗位
    staffs.findOne({ staff_id: req.body.staff_id, users: req.body.users }).then(staff => {
        if (staff) res.json({ code: 1, msg: '存在该员工' });
        let newStaff = new staffs({
            staff_name: req.body.staff_name,
            staff_email: req.body.staff_email,
            staff_phone: req.body.staff_phone,
            staff_position: req.body.staff_position,
            staff_time: req.body.staff_time,
            staff_id: req.body.staff_id,
            users: req.body.users
        });
        newStaff.save().then(result => {
            console.log(result);
            if (result.length <= 0) return res.json({ code: 1, msg: '操作失败，请重新添加员工' })
            return res.json({ code: 0, msg: '添加员工成功' })
        })
    })

})
/**
 * router  /api/staff/getStaff/:user_id
 * desc    获取员工
 * access  private
 */

router.get('/getStaff/:user_id', checkToken, (req, res) => {
    console.log(req.params);
    if (req.params.user_id != req.user._id) { return res.status(401).json({ code: 0, msg: '用户未登陆' }); }
    staffs.find({ users: req.params.user_id }).sort({ _id: -1 }).then(staff => {
        if (staff.length <= 0) return res.json({ code: 1, msg: '无数据' })
        res.json({ code: 0, msg: staff });
    })
})

/**
 * router /api/staff/putStaff
 * desc   修改员工信息
 * access private
 */

router.put('/putStaff', checkToken, (req, res) => {
    console.log(req.body.staff_quit);
    if (req.body.users != req.user._id) { return res.status(401).json({ code: 0, msg: '用户未登陆' }); }
    // req.body.staff_quit=req.body.staff_quit=='true'?'已离职':'未离职'
    staffs.update({ _id: req.body._id }, {
        $set: {
            staff_position: req.body.staff_position,
            staff_quit: req.body.staff_quit,
            staff_time: req.body.staff_time
        }
    }).then(staff=>{
        console.log(staff);
        if(staff) return res.json({code:0,msg:'修改成功'})
        return res.json({code:1,msg:'请重新修改 '})
    })
})
/**
 * router  api/staff/deleteStaff
 * desc    删除员工
 * access  peivate
 */
router.delete('/deleteStaff',checkToken,(req,res)=>{
    console.log(req.body)
    if (req.body.users != req.user._id) { return res.status(401).json({ code: 0, msg: '用户未登陆' }); }
    staffs.remove({_id:req.body._id}).then(staff=>{
        console.log(staff)
        if(staff) return res.json({code:0,msg:'已删除'})
        return res.json({code:1,msg:'删除失败，请重新操作'})
    })
})
module.exports = router;