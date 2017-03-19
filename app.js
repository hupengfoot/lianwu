/* jshint node:true*/
"use strict";
global.rootPath = __dirname;
var express = require('express');
var path = require('path');
var util = require('util');
var url = require('url');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

app.use(bodyParser({limit : '1mb'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser("ZC_COOKIE_STR_AQC"));

app.get('/checksignature', function(req, res){
    var param = url.parse(req.url, true).query;
    console.log(param);
    res.jsonp(param.echostr);
});

module.exports = app;

