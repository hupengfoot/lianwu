/*
 * 这个文件定义各种错误的含义
 */

var moment = require('moment');

var msg = {};
msg.define = {};
msg.code = {};
msg.code.ERR_SUCCESS = 0;
msg.code.ERR_DB_ERR = -1;

msg.define[msg.code.ERR_SUCCESS] = "success";
msg.define[msg.code.ERR_DB_ERR] = "服务器内部错误，请联系客服";
/*======================产品大哥(姐)看这里===============================*/


msg.getMsg = function(code, result){
    var obj = {};
    obj.errCode = code;
    obj.msg = msg.define[code];
    if(typeof result !== 'undefined' && result !== null){
        obj.result = result;
    }
    return obj;
};

msg.wrapper = function(err,result,res){
    if (err) {
        if(msg.define[err]){
            res.jsonp(msg.getMsg(err,result));
        }else{
            res.jsonp(msg.getMsg(msg.code.ERR_DB_ERR,result));
        }
    } else {
        res.jsonp(msg.getMsg(msg.code.ERR_SUCCESS,result));
    }
};

module.exports.global_msg_define = msg;
