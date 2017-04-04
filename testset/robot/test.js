var request = require('request');

var url = "http://123.207.16.146:80/user/teacher/add?" + encodeURI("szName=ender&szHeadUrl=xxxxx&szSignature=没有个性&szArea=上海市浦东区&iPrice=45&szType=拉丁舞&szPhone=13917658422&szFreeTime=周六下午");
request(url, function(err, res, body){
    console.log(err);
    console.log(body);
});
