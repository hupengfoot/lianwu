var path = require('path');
var util = require('util');
var async = require('async');
var sqlPool = require(path.join(global.rootPath, 'dbaccess/sqlPool'));
var msg = require(path.join(global.rootPath, "define/msg")).global_msg_define;


var teacherBiz = {};

teacherBiz.add = function(szName, szHeadUrl, szSignature, szArea, iPrice, szType, szPhone, szFreeTime, cb){
    sqlPool.excute(10001, [szName, szHeadUrl, szSignature, szArea, iPrice, szType, szPhone, szFreeTime], function(err, rows){
	cb(err, rows);
    });
};

teacherBiz.list = function(iPageSize, iPageNum, cb){
    var iStart = iPageNum * iPageSize;
    var iEnd = iPageSize;
    sqlPool.excute(1, [iStart, iEnd], cb);
};

module.exports = teacherBiz;
