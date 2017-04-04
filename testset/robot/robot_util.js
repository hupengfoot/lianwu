"use strict";
var url = require('url');
var assert = require('assert');
var async = require('async');
var request = require('request');

var expect = function(obj1,obj2) {
    if(obj1 !== obj2){
        console.error(' %s not equal %s',obj1,obj2);
        process.exit(-1);
    }
};

var robot_util = {};

var robot_config = require('./robot_config');
var config = robot_config;

//产生8位的随机QQ号
robot_util.randomQQ = function randomQQ(){
    var iQQ = 0;
    for(var i=0;i<8;i++){
        iQQ += Math.floor(Math.random()*10) + iQQ * 10;
    }
    return iQQ;
};

robot_util.randomBitNum = function(bit){
    var iQQ = 0;
    for(var i=0;i<bit;i++){
        iQQ += Math.floor(Math.random()*10) + iQQ * 10;
    }
    return iQQ;
};

robot_util.config = config;

robot_util.setTarget = function(szTarget) {
    config.host = robot_config.sets[szTarget].www;
    config.adminhost = robot_config.sets[szTarget].admin;
    robot_util.redis_ip = robot_config.sets[szTarget].redis_ip;
    robot_util.redis_port = robot_config.sets[szTarget].redis_port;
};


robot_util.setWWWIP = function(szIP) {
    config.host = szIP;
};

var bSkipError = false;

robot_util.setSkipError = function(bStatus) {
    bSkipError = bStatus;
};

// 获取长度为len的随机字符串
robot_util.getRandomString = function(len) {
    len = len || 32;
    var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz'; 
    var maxPos = $chars.length;
    var str = '';
    for (var i = 0; i < len; i++) {
        str += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return str;
};

robot_util.randomUrl = function(){
    return "www." + robot_util.getRandomString(8) + ".com";
};

robot_util.randomPicUrl = function() {
    var pic_list = ['http://shp.qpic.cn/zc_large/0/257_1457319031000/0', 'http://shp.qpic.cn/zc_large/0/714_1457317406000/800', 'http://shp.qpic.cn/zc_large/0/341_1457011616000/256', 'http://shp.qpic.cn/zc_large/0/897_1457317406000/800','http://shp.qpic.cn/zc_large/0/960_1453976107000/256','http://shp.qpic.cn/zc_large/0/290_1453288556000/256'];
    var len = pic_list.length;
    var idx = parseInt(Math.random() * len);
    return pic_list[idx];
};


//将参数数组拼接成 URL字符串
robot_util.arrToUrl = function arrToUrl(arr){
    if(arr === 0){
        return '';
    } 
    var search = '?';
    for(var key in arr){
        search += key + '=' + arr[key] + '&';
    }

    //删除最后一个&
    return search.substring(0,search.length - 1);
};

function format_url(host,path,obj){
    var search_str = robot_util.arrToUrl(obj);
    var param = {
        protocol : 'http',
        host     : host,
        pathname : path,
        search   : search_str,
    };
    console.log("url: %s", path + search_str);
    return url.format(param);
}

//生成访问www的URL
//obj为0时生成post
robot_util.makeUrl = function makeUrl(path,obj){
    return format_url(config.host,path,obj);
};

//生成admin访问URL
robot_util.makeAdminUrl = function makeUrl(path,obj){
    return format_url(config.adminhost,path,obj);
};


//统一检查返回值
function checkRes(body,cb){
    if(!body || body.indexOf('Cannot GET') > -1){
        console.error('404 error check url');
        cb(-1);
    }else{
        var param = [];
        try{
            param = JSON.parse(body);
        }catch(err){
            console.error("parse body error in check res");
            cb(body);
        }
        if(param.errCode === 0 && param.msg ==="success"){
            console.log('pass...');
            cb(null,param.result);
        }else{
            console.error(param);
            if (bSkipError) {
              cb(null,null);
            }else{
              cb(param.msg);
            }
        }
    }
}
//统一检查返回值
robot_util.checkRes = checkRes;

//带key的Cookie请求  GET
robot_util.requestWithKey = function(robot,dist_url,cb){
    var urlObj = url.parse(dist_url);
    if(dist_url.indexOf('?') === -1){
        dist_url = dist_url;
    }else{
        dist_url = dist_url;
    }
    var options = {
        url : encodeURI(dist_url),
    };
    console.log(options);
    request(options,cb);
};

//带key的POST请求  
robot_util.postWithKey = function(robot,dist_url,object,cb){
    var j = request.jar();
    var cookie = request.cookie('key=' + robot.key);
    j.setCookie(cookie,'http://' + config.host ,function(err,cookie){});
    var post_option = {
        url:dist_url,
        jar:j,
        form:object,
        headers : {
            //'user-agent': 'Robot Created By Grissom',
            'user-agent': 'Robot weixingamer',
        }
    };
    console.log(object);
    request.post(post_option,cb);
};


robot_util.sleep = function(iSecond) {
    return function(master,cb) {
        console.log('sleep for %d second',iSecond);
        setTimeout(cb,iSecond * 1000,null,master);
    };
};

robot_util.long_sleep = function(master,cb) {
    //sleep(2000); 
    setTimeout(cb,2000,null,master);
    //cb(null,master);
};

robot_util.short_sleep =function(master,cb) {
    //sleep(1000); 
    //cb(null,master);
    setTimeout(cb,1000,null,master);
};


function show_id_list(result) {
    var rows = result.rows;
    rows.forEach(function(one){
        console.log('iGoodsId : %d',one.iGoodsID);
    });
}


var afterThings = function(err,body,robot,cb,show_result,add_commd) {
  if (err) {
       console.error('error on http request');
       cb(err);
   }else{
       checkRes(body,function(err,result) {
           if (err) {
               console.error(body);
               cb(err);
           } else {
               if(show_result === 1){
                   console.log(result);
               }
                /*jslint evil: true */
               if(typeof add_commd === 'string'){
                   console.log('do addCommd : %s',add_commd);
                   eval(add_commd);
               }else{
                   if(add_commd && typeof add_commd === 'function'){
                       add_commd(robot,result);
                   }
               }
               cb(null,robot);
           }
       });
   }
};

robot_util.get_check = function req_check(robot,url,cb,show_result,add_commd) {
   robot_util.requestWithKey(robot,url,function(err,res,body) {
       afterThings(err,body,robot,cb,show_result,add_commd);
   });
};

robot_util.post_check = function(robot,url,obj,cb,show_result,add_commd) {
    robot_util.postWithKey(robot,url,obj,function(err,res,body) {
       afterThings(err,body,robot,cb,show_result,add_commd);
    });
};

robot_util.mainEntry = function(test_cases) {
    async.waterfall(test_cases,function(err,end_robot){
        if(err){
            console.error(err);
        }else{
            console.log("==============================");
            console.log("all testcase passed");
            //console.error(end_robot);
        }
    });
};

module.exports = robot_util;
