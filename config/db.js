const co = require('co');
const moment = require('moment');
// 配置公共的数据库
var mongoose=require('mongoose');
// build the connectiong string
var dbURI='mongodb://localhost:27017/toHelp';
mongoose.secretOrKey="secret"
// create thedatabase connection
mongoose.connect(dbURI);

// connection events
// when successfully connected
mongoose.connection.on('connected',function(){
    console.log('Mongoose defult connection open to '+dbURI);
});

// if connection throws an error
mongoose.connection.on('error',function(){
    console.log('Mongoose default connection error'+err);
});

// if connection is disconnected
mongoose.connection.on('disconne;cted',function(){
    console.log('Mongoose default connection disconnected');
});

// if the node process ends , close the Mongoose connection
process.on('SIGINT',function(){
    mongoose.connection.close(function(){
        console.log('Mongoose default connection disconnected through app termination');
        process.exit(0);
    })
});
// 数据库关闭连接

module.exports=mongoose