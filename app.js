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

app.use(bodyParser({limit : '1mb'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser("ZC_COOKIE_STR_AQC"));
app.use(express.static(path.join(__dirname, 'public')));

// 路由绑定
var initRoutes = require('./routes/init');
initRoutes(app);

module.exports = app;

