/*jshint multistr:true*/

module.exports.tableDbIndex = {
};

module.exports.sqls = {
    /**
     * 下标为1-4999的用于select语句
     */
    // 用户相关select
    '1' : '* FROM tbUserNickName_? WHERE szNickName = ?',
    //10000-14999 insert语句
    "10001":"INTO tbTeacher (szName, szHeadUrl, szSignature, szArea, iPrice, szType, szPhone, szFreeTime, dtRegisterTime) VALUES(?, ?, ?, ?, ?, ?, ?, ?, now())",

};
