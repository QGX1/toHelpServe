const express=require('express');
const router=express.Router();
const passport = require('passport');

const checkToken=passport.authenticate('jwt',{session:false});

module.exports=checkToken;