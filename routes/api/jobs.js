const express = require('express');
const router = express.Router();
const jobs = require('../../models/jobs');
const collects = require('../../models/collects');
const checkToken = require('../../config/checkToken');
const mongoose = require('mongoose');
/**
 * router POST api/job/addJob
 * desc   新增工作岗位
 * access private
 */
router.post('/addJob', checkToken, (req, res) => {
    //  console.log(req.body);
    if (req.body.users != req.user._id) { return res.status(401).json({ code: 0, msg: '用户未登陆' }); }
    let newJob = new jobs({
        job_post: req.body.job_post,
        job_salary: req.body.job_salary,
        job_site: req.body.job_site,
        job_ask_for: req.body.job_ask_for,
        job_educat: req.body.job_educat,
        job_descript: req.body.job_descript,
        job_skill: req.body.job_skill,
        job_nature: req.body.job_nature,
        longitude: req.body.longitude,
        latitude: req.body.latitude,
        users: req.body.users
    })
    newJob.save().then(result => {
        if (!result) return res.json({ code: 0, msg: '请重新输入' })
        res.json({ code: 0, msg: '发布成功' })
    })
});

/**
 * router api/job/:user_id
 * desc   查询发布的岗位
 * access private
 */
router.get('/:user_id', checkToken, (req, res) => {
    if (req.params.user_id != req.user._id) { return res.status(401).json({ code: 0, msg: '用户未登陆' }); }
    let total = 0;
    jobs.find({ users: req.params.user_id }).count(function (err, count) {
        return err ? false : total = count;
    });
    jobs.find({ users: req.params.user_id }).sort({ _id: -1 }).then(result => {
        // result.toJSON({getters: true})
        console.log(result)

        if (result.length <= 0) {
            res.json({ code: 0 })
        } else {
            res.json({ code: 0, msg: result, total });
        }
    })

})
/**
 * router api/job/putJob
 * desc   修改岗位信息
 * access private
 */
router.put('/putJob', checkToken, (req, res) => {
    if (req.body.users != req.user._id) { return res.status(401).json({ code: 0, msg: '用户未登陆' }); }
    jobs.update({ _id: req.body._id }, {
        $set: {
            job_ask_for: req.body.job_ask_for,
            job_descript: req.body.job_descript,
            job_educat: req.body.job_educat,
            job_nature: req.body.job_nature,
            job_post: req.body.job_post,
            job_salary: req.body.job_salary,
            job_site: req.body.job_site,
            job_skill: req.body.job_skill,
            job_timeout: req.body.job_timeout,
            latitude: req.body.latitude,
            longitude: req.body.longitude,
        }
    }).then(result => {
        if (!result) return res.json({ code: 1, msg: '修改失败' });
        return res.json({ code: 0, msg: '修改成功' })
    })
})
/**
 * router /api/job/deleteJob
 * desc   删除岗位，联表删除收藏
 * access private
 */
router.delete('/deleteJob', checkToken, (req, res) => {
    console.log(req.body)
    collects.remove({ jobs: req.body._id }).then(collect => {
        console.log(collect);
        jobs.remove({ _id: req.body._id }).then((result,err) => {
            // console.log(result);
            if (!result) return res.json({ code: 1, msg: '删除失败' });
            return res.json({ code: 0, msg: '已删除' })
        })
    })

})

/**
 * router /api/job/getJob
 * desc  查询所有岗位信息
 * access public
 */
router.get('/', checkToken, (req, res) => {
    // 分页查询
    console.log(req.query)
    // 查询总过有多少数据
    let total = 0;
    jobs.count(function (err, count) {
        return err ? false : total = count;
    });
    // 分页处理
    let preNum = req.query.preNum,
        limitNum = parseInt(req.query.limit),
        nextNum = req.query.nextNum,
        _id = req.query._id;
    let query;//存储数据库中查找的数据
    let skips = null;//跳过数据
    //判断数据向前还是向后获取
    if (nextNum - preNum > 0) {
        // 数据向后获取
        skips = (nextNum - preNum - 1) * limitNum;//判断向后跳过多少数据
    } else {
        skips = (preNum - nextNum - 1) * limitNum;//判断向前跳过多少数据
    }
    // 判断数据是否为初始化，根据前段是否有传送_id值
    if (_id) {
        // 不是数据初始化,比较_id判断是向前获取数据还是向后获取数据[数据库数据存储是由小到大——id]
        let id = mongoose.Types.ObjectId(_id);
        if (nextNum - preNum > 0) {
            query = jobs.find({ '_id': { "$lt": id } });
            console.log(query);
        } else {
            query = jobs.find({ '_id': { "$gt": id } });
            console.log(query);
        }

    } else {
        query = jobs.find();
    }
    // 数据过滤,skip()限制返回数据的起点
    query.skip(skips).limit(limitNum).sort({ _id: -1 })
        .populate('users')
        .then(result => {
            // console.log(result);
            if (!result) return res.json({ code: 1, msg: '暂无数据', total })
            return res.json({ code: 0, msg: result, total });
        })
})


/**
 * router api/job/putJub
 * desc   管理员修改岗位状态
 * access private
 */
router.put('/updataJob', checkToken, (req, res) => {
    console.log(req.body)
    //console.log(JSON.parse(req.body))
    if (req.body["userInfo[user_limit]"] == 3) {
        jobs.update({ _id: req.body._id }, { $set: { job_examine: req.body.job_examine } }).then(result => {
            if (result) res.json({ code: 0, msg: '已修改' });
            else res.json({ code: 1, msg: '修改失败' })
        })
    }
})
/**
 * router api/job/allJob
 * desc   管理员查询所有岗位
 * access private
 */

router.get('/allJob/:user_limit', checkToken, (req, res) => {
    console.log(req.params)
    if (req.params.user_limit == 3) {
        jobs.find().count(function (err, count) {
            return err ? false : total = count;
        });
        jobs.find().sort({ _id: -1 }).then(result => {
            if (result.length <= 0) {
                res.json({ code: 0 })
            } else {
                res.json({ code: 0, msg: result, total });
            }
        })
    }
})
module.exports = router;