
var robot_config = {};

robot_config.sets = {
    'test1'  : {
        www : '123.207.16.146:80',
        admin : '123.207.16.146:80',
    },
};

robot_config.host = '123.207.16.146:80';
robot_config.adminhost = '123.207.16.146:80';
robot_config.www = "http://" + robot_config.host;

module.exports = robot_config;
