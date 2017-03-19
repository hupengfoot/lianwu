/* jshint node:true*/
"use strict";
global.rootPath = __dirname;
var express = require('express');
var path = require('path');
var util = require('util');
var url = require('url');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
global.logConf = require(path.join(global.rootPath, "util/logConf"));
var app = express();
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');

var accessLog = morgan({
        "format":"dev",
        "stream":{write:function(str){console.info(str);}}
});

app.use(accessLog);
app.use(bodyParser({limit : '1mb'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser("ZC_COOKIE_STR_AQC"));
app.get('/', function(req, res){
    var param = url.parse(req.url, true).query;
    console.log(param);
    res.send(param.echostr);
});

module.exports = app;

