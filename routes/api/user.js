const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
// 第三方密码加密库，是对原有bcrypt的优化，优点是不需要安装任何依赖
const passport = require('passport');
// require('./passport')(passport)
const jwt = require('jsonwebtoken');//生成token
const db = require('../../config/db');//引入数据库
const checkToken = require('../../config/checkToken');//验证token的配置
const users = require('../../models/users');
const randomCode = require('../../util/codes').randomCode;
const sendCode = require('../../util/codes').sendCode;
const sendVerify = require('../../util/codes').sendVerify;
var svgCaptcha = require('svg-captcha');
const emailCfg = require('../../util/emailCfg')
let userCode = {}

/**
 * router Get /api/user/phoneCode
 * desc   获取手机验证码
 * access public
 */
router.get('/phoneCode/:user_phone', (req, res) => {
    console.log(req.params.user_phone);
    //1、获取手机号码
    let user_phone = req.params.user_phone;
    // 2、生成随机验证码
    var code = randomCode(6);
    console.log(code)
    // 3、将验证码发送给指定的手机号码
    sendCode(user_phone, code, (success) => {
        // 验证码发送成功，将验证码保存在userCode中
        if (success) {
            userCode[user_phone] = code;
            console.log('保存验证码:', user_phone, code);
            return res.json({ code: 0, msg: '验证码已发送' })
        }
        return res.json({ code: 1, msg: '发送失败' })
    })
})

/**
 * router  POST api/users/register
 * desc    注册
 * access  public
 */
router.post('/register', (req, res) => {
    // 判断用户验证码
    console.log(req.body)
    if (userCode[req.body.user_phone] != req.body.phone_code) return res.json({ code: 1, msg: '手机号或验证码不正确' })
    console.log(userCode[req.body.user_phone])
    users.findOne({ user_email: req.body.user_email })
        .then(user => {
            if (user) {
                return res.json({
                    code: 1,
                    msg: '邮箱已被注册'
                });
            } else {
                console.log("注册用户的信息")
                //不存在，则存储
                const newUser = new users({
                    user_name: req.body.user_name,
                    user_email: req.body.user_email,
                    user_password: req.body.user_password,
                    user_phone: req.body.user_phone,
                    user_avatar: req.body.user_avatar,
                    user_limit: req.body.user_limit,//用户权限
                    user_company_position: req.body.user_company_position,//用户-公司-职位
                    user_incumbency: req.body.user_incumbency,
                    user_company: req.body.user_company
                });//构造函数
                console.log(newUser);
                // 加密bcrypt.genSalt()这个方法本身就是异步的，这时候再用await会出问题
                // bcrypt.gentSalt(10,callback)//设置加密强度，随机生成29个盐字符
                bcrypt.genSalt(10, function (err, salt) {
                    bcrypt.hash(newUser.user_password, salt, (err, hash) => {//加密的内容
                        if (err) return res.json({ status: 1, msg: '注册失败', err: err });
                        newUser.user_password = hash;
                        newUser
                            .save()
                            .then(user => {
                                delete userCode[req.body.user_phone];
                                return res.status(200).json({ code: 0, msg: '注册成功' })
                            })
                            .catch(err => {
                                return res.json({
                                    code: 1,
                                    msg: '注册失败，请重新注册'
                                })
                            }
                            );
                    });
                });
            }
        })
});


/**
 * router  POST api/users/login
 * desc    登录 返回token jwt passport
 * access  public
 */
router.post('/login', function (req, res) {
    console.log(req.body.captcha)
    console.log(req.session.captcha)
    const user_email = req.body.user_email;
    const user_password = req.body.user_password;//用户密码要加密
   // console.log(req.body)
    if(req.body.captcha.toLowerCase()!=req.session.captcha) return res.json({code:1,msg:'验证码不正确'})
    // 删除保存的验证码
    delete req.session.captcha;
    // 查询数据库
    users.findOne({
        user_email,
        user_limit: req.body.user_limit
    }).then(user => {
        if (!user) return res.json({
            code: 1,
            msg: '用户不存在'
        })
        //1 用户存在，判断密码是否正确，解析密码加密bcrypt
        //2生成token返回给前端
        bcrypt.compare(user_password, user.user_password).then(isMatch => {
            console.log(isMatch);
            if (!isMatch) return res.json({
                code: 1,
                msg: '密码错误'
            })
            const rule = {
                id: user._id,//注意生成token与之id有关，不能修改成user_id
                user_name: user.user_name,
                user_email: user.user_email,
                user_phone: user.user_phone,
                user_avatar: user.user_avatar,
                user_limit: user.user_limit,
                user_company_position: user.user_company_position,
                user_company: user.user_company
            }
            req.session.userid = user._id;//存储用户id
            // console.log(rule);
            // console.log(db.secretOrKey)
            // jwt.sign('规则'，'加密名字'，'过期时间'，'回调箭头函数')
            jwt.sign(rule, db.secretOrKey, { expiresIn: 3600 }, (err, token) => {
                if (err) throw err;
                res.json({
                    code: 0,
                    msg: '登录成功',
                    token: 'Bearer ' + token,
                    rule
                })
            })
        })
    })
});

/**
 * router GET api/user/verify
 * desc   图形验证码
 * access public
 */
router.get('/verify', function (req, res) {
    // let captcha=sendVerify();
    // req.session.captcha=captcha.text.toLowerCase()
    //console.log(req.session)
    var captcha = svgCaptcha.create({
        ignoreChars: '0o1l',
        noise: 2,
        color: true
    });
    req.session.captcha = captcha.text.toLowerCase();
    console.log(req.session)
    // console.log(req.session)
    return res.type('svg').send(captcha.data)
})

/**
 * router GET api/user/getUserInfo
 * desc   根据session中的存储的token,查询对应的user
 * access private
 */
router.get('/getUserInfo', (req, res) => {
    //console.log('解决页面刷新数据丢失的问题', req.user._id)
    //取出userid
    const userid = req.session.userid;
    // 查询
    users.findOne({ _id: userid }).then(user => {
        if (!user) {
            // 清除浏览器保存得userid得cookie【session是基于cookie的操作】
            delete req.session.userid;
            res.status(401).json({ code: 1, msg: '请先登录' })
        } else {
            res.json({ code: 0, msg: user })
        }
    })
})
/**
 * router GET api/user/getUserInfo
 * desc   根据session中的存储的token,查询对应的user
 * access private
 */
router.get('/getUserInfo2', (req, res) => {
    // console.log('解决页面刷新数据丢失的问题',req.user)
    //取出userid
    const userid = req.session.userid;
    // 查询
    users.findOne({ _id: userid }).then(user => {
        if (!user) {
            // 清除浏览器保存得userid得cookie【session是基于cookie的操作】
            delete req.session.userid;
            res.status(401).json({ code: 1, msg: '请先登录' })
        } else {
            res.json({ code: 0, msg: user })
        }
    })
})
/**
 * router api/user/changePassword
 * desc   修改密码
 * access private
 */
router.put('/changePassword', checkToken, (req, res) => {
    console.log(req.body)
    if (req.body.users != req.user._id) { return res.status(401).json({ code: 0, msg: '用户未登陆' }); }
    users.finedOne({ id: req.body.users }).then(result => {
        if (!result) return res.json({ code: 1, msg: '没有该用户' })
        // 验证密码是否正确
        bcrypt.compare(req.body.user_password, result.user_password).then(isMatch => {
            console.log(isMatch);
            if (!isMatch) return res.json({
                code: 1,
                msg: '密码错误'
            })
            // 密码正确
            // 新密码加密存储
            bcrypt.genSalt(10, function (err, salt) {
                bcrypt.hash(newUser.user_password, salt, (err, hash) => {//加密的内容
                    if (err) return res.json({ code: 1, msg: '注册失败' });
                    users.update({ _id: req.body.users }, { $set: { user_password: hash } }).then(reult => {
                        if (!result) return res.json({ code: 1, msg: '修改失败' })
                        return res.json({ code: 0, msg: '修改成功' })
                    })
                })
            })
        })
    })
})
/**
 * desc 验证旧密码是否正确
 */
router.post('/checkPsw', checkToken, (req, res) => {
    console.log(req.body)
    if (req.body.users != req.user._id) { return res.status(401).json({ code: 0, msg: '用户未登陆' }); }
    users.findOne({ _id: req.body.users }).then(result => {
        if (!result) return res.json({ code: 1, msg: '没有该用户' })
        // 验证密码是否正确
        bcrypt.compare(req.body.user_password, result.user_password).then(isMatch => {
            console.log(isMatch);
            if (!isMatch) return res.json({
                code: 1,
                msg: '密码错误'
            })
            return res.json({ code: 0, msg: '密码正确' })
        })
    })
})
/**
 * router api/user/newPsw
 * desc   输入新密码
 * access private
 */
router.put('/newPsw', checkToken, (req, res) => {
    if (req.body.users != req.user._id) { return res.status(401).json({ code: 0, msg: '用户未登陆' }); }
    // 新密码加密存储
    console.log(req.body)
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(req.body.new_password, salt, (err, hash) => {//加密的内容
            console.log(err)
            if (err) return res.json({ code: 1, msg: '密码修改失败', err: err });
            users.update({ _id: req.body.users }, { $set: { user_password: hash } }).then(result => {
                if (!result) return res.json({ code: 1, msg: '密码修改失败' })
                return res.json({ code: 0, msg: '密码修改成功' })
            })
        })
    })
})

/**
 * router GET api/user/forgetPwd?user_email
 * desc   忘记密码
 * access public
 */
router.post('/forgetPwd', (req, res) => {
    console.log(req.body)
    // 验证用户邮箱是否存在
    users.findOne({
        user_email: req.body.email,
        user_limit: req.body.user_limit
    }).then(user => {
        console.log(user)
        if (!user) return res.json({ coed: 1, msg: '暂无该用户' })
        // 用户存在，发送邮箱给用户
        const user_limit = user.user_limit == 1 ? '用户' : '商家';
        const user_email = req.body.email;
        const subject = '互助--邮件'
        const text = '亲爱的用户：该功能暂时未开放'
        // const html = `<h4>亲爱的${user_limit}：若要找回密码请点击下方链接:</h4><a class="elem-a" href="https://baidu.com"><span class="content-elem-span">找回密码</span></a>`
        const sendResult = emailCfg.sendMail(user_email, subject, text, html)
        if (sendResult) {
            return res.json({ code: 0, msg: '已发送' })
        } else {
            return res.json({ code: 0, msg: '已发送失败' })
        }
    })
})

/**
 * router GET api/users/all
 * desc   获取所有联系人信息
 * access Private
 */
//1、 创建JWT验证的秘密路由
router.get('/all', passport.authenticate('jwt', { session: false }), (req, res) => {
    // console.log(passport.authenticate('jwt',{session:false}))
    console.log("登录")
    users.find().then(user => {
        if (!user) {
            return res.json({
                code: 1,
                msg: '没有任何用户信息'
            });
        }
        let newUsers = [];
        console.log(user)
        // 遍历数据，将需要返回给前端的数据遍历出来，不改变原来的数组
        user.forEach((item, index, user) => {
            let usersObj = {};
            usersObj = {
                user_id: item._id,
                user_name: item.user_name,
                user_avatar: item.user_avatar,
                user_incumbency: item.user_incumbency
            }
            newUsers.push(usersObj)
        })
        return res.json({
            msg: newUsers,
            code: 0
        })

    })
})

/**
 * router GET api/users/allUser
 * desc   获取所有用户
 * access Private
 */
//1、 创建JWT验证的秘密路由
router.get('/allUser', passport.authenticate('jwt', { session: false }), (req, res) => {
    // console.log(passport.authenticate('jwt',{session:false}))
    // console.log("登录")
    //获取所有普通用户信息
    users.find({ user_limit: 1 }, { _id: 1, user_name: 1, user_avatar: 1, user_phone: 1, user_email: 1 }).then(user => {
        if (!user) {
            return res.json({
                code: 1,
                msg: '没有任何用户信息'
            });
        }
        // let newUsers=[];
        // console.log(user)
        // 遍历数据，将需要返回给前端的数据遍历出来，不改变原来的数组
        // user.forEach((item,index,user)=>{
        //     let usersObj={};
        //     usersObj={
        //         id:item._id,
        //         user_name:item.user_name,
        //         user_avatar:item.user_avatar,
        //         user_phone:item.user_phone,
        //         user_email:item.user_email
        //     }
        //     newUsers.push(usersObj)
        // })
        return res.json({
            msg: user,
            code: 0
        })

    })
})

/**
 * router GET api/user/:user_id
 * desc   通过user_id获取个人信息
 * access  Private
 */
router.get('/:user_id', checkToken, (req, res) => {
    console.log(222, req.params, req.user)
    if (req.params.user_id != req.user._id) { return res.status(401).json({ status: 0, msg: '用户未登陆' }); }
    users.findOne({ _id: req.params.user_id })
        .populate('users', ['user_name', 'user_avatar', 'user_incumbency'])//联表查询
        .then(user => {
            if (!user) return res.json({
                code: 0,
                msg: '未找到改用户的信息'
            })
            let newUsers = {};
            console.log(user.user_avatar)
            newUsers = {
                id: user._id,
                user_name: user.user_name,
                user_avatar: user.user_avatar,
                user_incumbency: user.user_incumbency,
                user_phone: user.user_phone,
                user_limit: user.user_limit,
                user_email: user.user_email,
                user_company_position: user.user_company_position,
                user_company: user.user_company
            };
            return res.json({ msg: newUsers, code: 0 })
        })
        // 捕获异常
        .catch(err => {
            res.status(404).json({ code: 1, err })
        })
})

/**
 * router put api/user/updateUserInfo
 * desc   修改商家信息
 * access Private
 * */
router.put('/updateUserInfor', checkToken, (req, res) => {
    // if(req.body.user_id!=req.user._id){ return res.status(401).json({status:0,msg:'用户未登陆'});}
    console.log(req.body)
    let user_name = req.body.user_name,
        user_avatar = req.body.user_avatar,
        user_incumbency = req.body.user_incumbency,
        user_phone = req.body.user_phone,
        user_company_position = req.body.user_company_position,
        user_email = req.body.user_email,
        user_company = req.body.user_company;
    // 存在修改
    users.update({ _id: req.body.id }, {
        $set: {
            user_name: user_name,
            user_avatar,
            user_incumbency,
            user_phone,
            user_company_position,
            user_email,
            user_company
        }
    })
        .then(result => {
            console.log(result.nModified)
            if (!result) return res.json({ code: 1, msg: '修改失败' });
            return res.json({ code: 0, msg: '修改成功' })
        })
        .catch(err => { return res.status(404).json({ code: 0, msg: err }) })
})
/**
 * router api/user/updataAvatar
 */
router.put('/updataAvatar', checkToken, (req, res) => {
    // if(req.body.user_id!=req.user._id){ return res.status(401).json({status:0,msg:'用户未登陆'});}
    console.log(req.body)
    let user_avatar = req.body.user_avatar;
    // 存在修改
    users.update({ _id: req.body._id }, {
        $set: {
            user_avatar
        }
    })
        .then(result => {
            //console.log(result.nModified)
            if (!result) return res.json({ code: 1, msg: '修改失败' });
            return res.json({ code: 0, msg: '修改成功' })
        })
        .catch(err => { return res.status(404).json({ code: 0, msg: err }) })
})


module.exports = router;
