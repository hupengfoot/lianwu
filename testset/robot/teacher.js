"use strict";
var http = require('http');
var util = require('util');
var request = require('request');
var async = require('async');
var assert = require('assert');
var moment =require('moment');
var robot_util = require('./robot_util');
var getRandomString = robot_util.getRandomString;
var checkRes = robot_util.checkRes;
var makeUrl = robot_util.makeUrl;
var makeAdminUrl = robot_util.makeAdminUrl;
var requestWithKey = robot_util.requestWithKey;
var postWithKey = robot_util.postWithKey;
var randomUrl = robot_util.randomUrl;
var req_check = robot_util.req_check;

var add = function(robot, cb){
    var robot = {};
    robot.key = "xxx";
    var obj = {};
    obj.szName = "ender";
    obj.szHeadUrl = "xxxxx";
    obj.szSignature = "没有个性";
    obj.szArea = "上海市浦东区";
    obj.iPrice = 45;
    obj.szType = "拉丁舞";
    obj.szPhone = "13917658422";
    obj.szFreeTime = "周六下午";
    
    var dist_url = makeUrl("/user/teacher/add", obj);
    requestWithKey(robot, dist_url, function(err, res, body){
        checkRes(body, function(err, result){
            if(err){
                cb('err on commmit');
            } 
            else {
                console.error(result);
                cb(null,robot);
            }
        });
    });
};

var test_cases =
[
    add,
];

function test_main() {
    (function(){
        async.waterfall(test_cases,function(err,end_robot){
            if(err){
                console.error(err);
            }else{
                console.log("all testcase passed");
                console.error(end_robot);
            }
        });
    })();
}

if (require.main === module) {
    test_main();
}

