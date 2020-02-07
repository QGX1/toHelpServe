// 对passport进行一些配置，所以在config下面新建一个passport.js文件
//使用passport-jwt验证token
/**
 *  不配置该文件在使用passport.authenticate('jwt',{session:false})该语法
 * 核对用户的token时，会报如下错误
 * Unknown authentication strategy &quot;jwt&quot未知身份验证策略
 *  */

const JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require("mongoose");
const User = mongoose.model("users");
const db = require("./db");

const opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = db.secretOrKey;

module.exports = passport => {
    passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
        // console.log(jwt_payload);
        User.findById(jwt_payload.id)
            .then(user => {
                if (user) {
                    return done(null, user);
                }
                return done(null, false);
            })
            .catch(err => console.log(err));
    }));
}