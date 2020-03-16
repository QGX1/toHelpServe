var createError = require('http-errors');
var express = require('express');
var path = require('path');
// var cookieParser = require('cookie-parser');
var session=require('express-session')
var logger = require('morgan');
var bodyParser=require('body-parser')//解析中间件
var passport = require('passport');
// passport-jwt和passport中间件来验证token，passport-jwt是一个针对jsonwebtoken的插件，passport是express框架的一个针对密码的中间件
var user = require('./routes/api/user');
var infor = require('./routes/api/infor');
var dynamic = require('./routes/api/dynamic');
var like = require('./routes/api/like');
var comment = require('./routes/api/comment');
var sendImg = require('./routes/api/sendImg');
var jobs = require('./routes/api/jobs');
var staff = require('./routes/api/staff');
var attendance = require('./routes/api/attendance');
var collect = require('./routes/api/collect');
var complaint = require('./routes/api/complaint');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.all("*", function(req, res, next) {
  if (!req.get("Origin")) return next();
  // use "*" here to accept any origin
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET");
  res.set("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
  // res.set('Access-Control-Allow-Max-Age', 3600);
  if ("OPTIONS" === req.method) return res.send(200);
  next();
});

app.use(express.static(path.join(__dirname, 'public')));
// 使用body-parser中间件
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());
app.use(bodyParser.json({limit:'50mb'}));
app.use(bodyParser.urlencoded({limit:'50mb',extended:true}));
// passport初始化
app.use(passport.initialize());
require("./config/passport")(passport);//配置passport

// app.use(cookieParser());
//  配置session
// app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret:"dsafsafsf",		//设置签名秘钥  内容可以任意填写
  cookie:{maxAge:80*1000},		//设置cookie的过期时间，例：80s后session和相应的cookie失效过期
  resave:false,			//强制保存，如果session没有被修改也要重新保存
  saveUninitialized:true		//如果原先没有session那么久设置，否则不设置
}));

// 路由挂载
app.use('/api/user', user);
app.use('/api/infor', infor);
app.use('/api/dynamic', dynamic);
app.use('/api/like', like);
app.use('/api/comment', comment);
app.use('/api/sendImg', sendImg);
app.use('/api/job', jobs);
app.use('/api/staff', staff);
app.use('/api/attendance', attendance);
app.use('/api/collect', collect);
app.use('/api/complaint', complaint);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
const port = process.env.PORT || 5001;
app.listen(port,()=>{
  console.log(`server is running on port ${port}`)
})

module.exports = app;
