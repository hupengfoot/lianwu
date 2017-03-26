var https = require('https');

var createMenu = function(){
    var data ={
	"button":[
	{
	    "name":"菜单",
	    "sub_button":[
	    {   
		"type":"view",
		"name":"教师注册",
		"url":"http://123.207.16.146/submit_teacher.html"
	    }]
	}]
    };
    var options ={
	hostname:'api.weixin.qq.com',
	port:443,
	path:'/cgi-bin/menu/create?access_token=ACCESS_TOKEN',
	method:'POST',
    };

    var req = https.request(options, (res) => {
	console.log('statusCode:', res.statusCode);
	console.log('headers:', res.headers);

	res.on('data', (d) => {
	    process.stdout.write(d);
	});
    });

    req.on('error', (e) => {
	console.error(e);
    });
    req.end();
};

createMenu();
