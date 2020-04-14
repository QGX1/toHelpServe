// 考勤数据表的操作
const express = require('express');
const router = express.Router();
const db = require('../../config/db');//引入数据库
const checkToken = require('../../config/checkToken');//验证token的配置
const attendances = require('../../models/attendances');

/**
 * router api/attendance/addAtendance
 * desc   添加考勤数据
 * access private
 */
router.post('/addAttendance',checkToken,(req,res)=>{
    console.log(req.body);
    if (req.body.users != req.user._id) { return res.status(401).json({ code: 0, msg: '用户未登陆' }); }
    // 插入数据时判断当天是否已经插入过考勤，如果同一天插入考勤大于12小时的话则不给插入，否则插入数据
    attendances.find({users:req.body.users,staffs:req.body.staffs,work_time:req.body.work_time}).then(attendance=>{
        //console.log(attendance[0])
        if(attendance.length>0){
            //console.log('存在数据')
            // 已存在考勤,小于12存入数据，否则不给存入
            let totalHours=attendance[0].work_hours+parseInt(req.body.work_hours);
            if(totalHours<=12){
                attendances.update({_id:attendance[0]._id},{$set:{
                    work_hours:totalHours
                }}).then(result=>{
                    if(result) return res.json({code:0,msg:'考勤录入成功'});
                    return res.json({code:1,msg:'考勤录入失败，请重新录入'});
                })
            }else{
                // 存在考勤，但是同一天大于12小时不给录入
                return res.json({code:1,msg:'同一天的考勤时间不能大于12小时'});
            }
        }else{
            //console.log('不存在数据');
            attendances.create({
                users:req.body.users,
                staffs:req.body.staffs,
                work_hours:req.body.work_hours,
                work_time:req.body.work_time
            }).then(attendance=>{
                //console.log(attendance);
                if(attendance) return res.json({code:0,msg:'考勤录入成功'});
                return res.json({code:1,msg:'考勤录入失败，请重新录入'});
            })
        }
    })
})
/**
 * router api/attendace/getAttendance
 * desc   获取商家考勤列表
 * access private
 */
router.get('/getAttendance/:users',checkToken,(req,res)=>{
    if (req.params.users != req.user._id) { return res.status(401).json({ code: 0, msg: '用户未登陆' }); }
    // 联表查询
    attendances.find({users:req.params.users})
    .populate('users')
    .populate({
        path:'staffs',
        populate:{
            path:'staff_id'
        }
    })
    .sort({work_time:-1})
    .then(result=>{
        return res.json({code:0,msg:result})
    })
})
/**
 * router api/attendace/getStaffAttendance
 * desc   获取员工考勤列表
 * access private
 */
router.get('/getStaffAttendance',checkToken,(req,res)=>{

    if (req.query.users != req.user._id) { return res.status(401).json({ code: 0, msg: '用户未登陆' }); }
    // 联表查询
    attendances.find()
    .populate('users')//商家信息
    .populate({
        path:'staffs',
        populate:({
            path:'staff_id'         
        })
    })//员工信息
    .sort({work_time:-1})
    .then(result=>{
        if(result.length>0){
            let newResult=result.filter((item)=>{
                return item.staffs.staff_id.user_email== req.query.user_email;  
            })
            return res.json({code:0,msg:newResult});
        }
        return res.json({code:1,msg:result})
    })
})
/**
 * router api/attendance/putAttendance
 * desc   修改考勤
 * access private
 */
router.put('/putAttendance',checkToken,(req,res)=>{
    if (req.body.users != req.user._id) { return res.status(401).json({ code: 0, msg: '用户未登陆' }); }
    console.log(req.body);
    attendances.update({_id:req.body._id},{$set:{
        work_time:req.body.work_time,
        work_hours:req.body.work_hours
    }}).then(result=>{
        console.log(result)
        if(result) return res.json({code:0,msg:'考勤修改成功'});
        return res.json({code:1,msg:'考勤修改失败，请重新操作'})
    })
})

/**
 * router api/attendance/deleteAttendance
 * desc   删除考勤
 * access private
 */
router.delete('/deleteAttendance',checkToken,(req,res)=>{
    console.log(req.body);
    if (req.body.users != req.user._id) { return res.status(401).json({ code: 0, msg: '用户未登陆' }); }
    attendances.remove({_id:req.body._id}).then(result=>{
        console.log(result);
        if(result) return res.json({code:0,msg:'考勤删除成功'});
        return res.json({code:1,msg:'考勤删除失败'});
    })
})
module.exports=router;