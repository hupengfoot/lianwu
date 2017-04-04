var path = require('path');
var async = require('async');
var domain = require('domain');
var morgan = require('morgan');

var _ = {};
var aMids = [];


var serial = function(req, res, next){
    process.SN = (process.SN && ++process.SN) || 1;
    var d = domain.create();
    d.session = {};
    d.session.SN = process.SN;
    d.add(req);
    d.add(res);
    d.run(function(){
        next();
    });
};

//使用morgan打access log 
var accessLog = morgan("dev",{
    "stream":{write:function(str){console.info(str.trim());}}
});

var accessLogger = function(req,res,next) {
    req._startTime = new Date();
    function logRequest(){
        res.removeListener('finish', logRequest);
        res.removeListener('close', logRequest);
        const logObj = { 
            l1 : req.method || 'METHOD',
            l2 : req.originalUrl || '_',
            l3 : res.statusCode || 501,
            l4  : new Date() - req._startTime,
        };  
    }   

    res.on('finish', logRequest);
    res.on('close', logRequest);
    next();
};


_.commonInit = function(app){
    aMids.push({f:null, r:null, a:serial});
    aMids.push({f:null, r:null, a:accessLog});
    aMids.push({f:null, r:null, a:accessLogger});

};

_.userInit = function(app){
	//玩家侧
    aMids.push({f:'routes/user/teacher', r:'/user/teacher'});

};

_.masterInit = function(app){

};


var initRoutes = function(app){
    console.time('all');
    _.commonInit(app);
    _.userInit(app);
    _.masterInit(app);
    
    console.time('async');
    var iMax = 0;
    var szMax = '';
    async.each(aMids, function(mid,callback){
        var t1 = new Date().getTime();
        var a = mid.a;
        if(mid.f){
            a = require(path.join(global.rootPath, mid.f));
        }
        if(mid.r){
            app.use(mid.r, a);
        }else{
            app.use(a);
        }
        var t2 = new Date().getTime();
        if(t2 - t1 > iMax){
            iMax = t2 - t1;
            szMax = require('util').format("{f:%s,r:%s,a:%s} used max time %dms", mid.f, mid.r, mid.a, t2-t1);
        }
        callback();
    },function(){
    });
    console.log(szMax);
    console.timeEnd('async');

    console.timeEnd('all');
};

module.exports = initRoutes;
