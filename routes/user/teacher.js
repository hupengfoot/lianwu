"user strict"
var express = require('express');
var router = express.Router();
var path = require('path');
var url = require('url');
var teacherBiz = require(path.join(global.rootPath, "interfaceBiz/teacherBiz"));
var msg = require(path.join(global.rootPath, "define/msg")).global_msg_define;

router.get('/add', function(req, res){
    var param = url.parse(req.url, true).query;
    teacherBiz.add(param.szName, param.szHeadUrl, param.szSignature, param.szArea, param.iPrice, param.szType, param.szPhone, param.szFreeTime, function(err, rows){
	msg.wrapper(err, rows, res);
    });
});

module.exports = router;
