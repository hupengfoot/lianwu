var mysql = require('mysql'); 
var path = require('path');
var underscore = require('underscore');
var arConfigList = require(path.join(global.rootPath, "config/mysql.json"));
var sqls = require('./sql_define').sqls;
var dbIndex = require(path.join(global.rootPath, 'define/dbIndex'));

var dbArray = [];

arConfigList.forEach(function(config){
    console.log('LOAD DB %s CONFIG %s:%d-%s',
               config.szDbName,config.writeDB.szDbIP,
               config.writeDB.szDbPort,config.writeDB.szDbDefaultDb);

    var readPool = mysql.createPool({
        host:config.readDB.szDbIP,
        port:config.readDB.szDbPort,
        user:config.readDB.szDbUser,
        password:config.readDB.szDbPwd,
        database:config.readDB.szDbDefaultDb,
        supportBigNumbers :true,
        connectionLimit:'10',
        timezone:'Asia/Hong Kong'});

    var writePool = mysql.createPool({
        host:config.writeDB.szDbIP,
        port:config.writeDB.szDbPort,
        user:config.writeDB.szDbUser,
        password:config.writeDB.szDbPwd,
        database:config.writeDB.szDbDefaultDb,
        supportBigNumbers :true,
        connectionLimit:'10',
        timezone:'Asia/Hong Kong'});

    var dbObj = {
        readPool : readPool,
        writePool : writePool,
    };

    if (config.slaveDB) {
        var slavePool = mysql.createPool({
            host:config.slaveDB.szDbIP,
            port:config.slaveDB.szDbPort,
            user:config.slaveDB.szDbUser,
            password:config.slaveDB.szDbPwd,
            database:config.slaveDB.szDbDefaultDb,
            supportBigNumbers :true,
            connectionLimit:'10',
            timezone:'Asia/Hong Kong'});

        dbObj.slavePool = slavePool;
    }

    dbArray.push(dbObj);
});


//默认sqlPool
var sqlPool = mysql.createPool({
	host:arConfigList[0].writeDB.szDbIP,
	port:arConfigList[0].writeDB.szDbPort,
	user:arConfigList[0].writeDB.szDbUser,
	password:arConfigList[0].writeDB.szDbPwd,
	database:arConfigList[0].writeDB.szDbDefaultDb,
    supportBigNumbers:true,
	connectionLimit:'10',
	timezone:'Asia/Hong Kong'});

// SQL执行要使用的pool类型枚举
sqlPool.dbTypeEnum = {
    dbType_read : 1,
    dbType_write : 2,
    dbType_slave : 3,
};

var escapeId = function (val, forbidQualified) {
	if (Array.isArray(val)) {
        return val.map(function(v) {
            return escapeId(v, forbidQualified);
        }).join(', ');
	}
	if (forbidQualified) {
        return "'" + val.replace(/`/g, '``').replace(/^\s*'*|'*\s*$/,'') + "'";
	}
	return "'" + val.replace(/`/g, '``').replace(/\./g, '`.`').replace(/^\s*'*|'*\s*$/g,'') + "'";
};


//for repair func undef
var dateToString = function(val,timeZone) {
    console.error('sql params err Object try to string');
    if(val.toString && typeof val.toString === 'function'){
        return val.toString();
    }else{
        return 'error object';
    }
};
var bufferToString = dateToString;
var objectToValues = dateToString;

var my_escape = function(val, stringifyObjects, timeZone) {
	if (val === undefined || val === null) {
        return 'NULL';
	}
	switch (typeof val) {
        case 'boolean': return (val) ? 'true' : 'false';
        case 'number': return val+'';
	}
	if (val instanceof Date) {
        val = dateToString(val, timeZone || 'local');
	}
	if (Buffer.isBuffer(val)) {
        return bufferToString(val);
	}
	if (Array.isArray(val)) {
        return arrayToList(val, timeZone);
	}
	if (typeof val === 'object') {
        if (stringifyObjects) {
            val = val.toString();
        } else {
            return objectToValues(val, timeZone);
        }
	}
    val = val.replace(/[\0\n\r\b\t\\\'\"\x1a]/g, function(s) {
        switch(s) {
            case "\0": return "\\0";
            case "\n": return "\\n";
            case "\r": return "\\r";
            case "\b": return "\\b";
            case "\t": return "\\t";
            case "\x1a": return "\\Z";
            default: return "\\"+s;
        }
    });
    return "'"+val+"'";
};

var escapeOrg = function(val, stringifyObjects, timeZone) {
	if (val === undefined || val === null) {
		return 'NULL';
	}

	switch (typeof val) {
		case 'boolean': return (val) ? 'true' : 'false';
		case 'number': return val+'';
	}

	if (val instanceof Date) {
		val = dateToString(val, timeZone || 'local');
	}

	if (Buffer.isBuffer(val)) {
		return bufferToString(val);
	}

	if (Array.isArray(val)) {
		return arrayToList(val, timeZone);
	}

	if (typeof val === 'object') {
		if (stringifyObjects) {
			val = val.toString();
		} else {
			return objectToValues(val, timeZone);
		}
	}

    val = val.replace(/[\0\n\r\b\t\\\"\x1a]/g, function(s) {
        switch(s) {
            case "\0": return "\\0";
            case "\n": return "\\n";
            case "\r": return "\\r";
            case "\b": return "\\b";
            case "\t": return "\\t";
            case "\x1a": return "\\Z";
            default: return "\\"+s;
        }
    });
    return val;
};

var arrayToList = function(array, timeZone) {
	return array.map(function(v) {
        if (Array.isArray(v)){ return '(' + arrayToList(v, timeZone) + ')'; }
        return my_escape(v, true, timeZone);
	}).join(', ');
};

var format = function(sql, values, stringifyObjects, timeZone) {
	values = values === null ? [] : [].concat(values);
	return sql.replace(/\?\??|!/g, function(match) {
        if (!values.length) {
            return match;
        }
        if (match == "??") {
            return escapeId(values.shift());
        }
        if(match == "!"){
            return escapeOrg(values.shift(), stringifyObjects, timeZone);
        }
        return my_escape(values.shift(), stringifyObjects, timeZone);
	});
};

// in类型的条件字段
var inTypeFieldList = [
    "iBugStatus",
    "iStatus",
    "iFlag",
    "iTaskType",
    "iLimitType",
];

var filter = function(szOrder, szFilter, szValue){
    var szWhere = "";
    var inFilter = {};
    var astFilters = szFilter.split('|');
    szValue = szValue.replace("'","\\'");
    var astValues = szValue.split('|');
    var statuscnt = 0;
    for(var i=0; i!=astFilters.length; ++i){
        if(astFilters[i].length > 0){
            if(inTypeFieldList.indexOf(astFilters[i]) >= 0){
                if(inFilter.hasOwnProperty(astFilters[i])){
                    inFilter[astFilters[i]].push(astValues[i]);
                }else{
                    inFilter[astFilters[i]] = [];
                    inFilter[astFilters[i]].push(astValues[i]);
                }
                statuscnt++;
            }
            else{
                szWhere += " and " + astFilters[i] +"='"+astValues[i] + "'"; 
            }
        }
    }
    if(statuscnt > 0){
        var szFilterStatus = [];
        for(var j in inFilter){
            var tmp = '';
            tmp = tmp + j + ' in(' + inFilter[j].join(',') + ')';
            szFilterStatus.push(tmp);    
        }
        var szStatus = '(' + szFilterStatus.join(' and ') + ')';
        szWhere = szWhere + " and " +szStatus;
    }
    if(typeof szOrder != "undefined" && szOrder.length > 0){
        szWhere += " order by " + szOrder + " desc ";
    }
    return szWhere;
};

var orfilter = function(szOrder, szFilter, szValue){
    var szWhere = " (1=2";
    var astFilters = szFilter.split('|');
    szValue = szValue.replace("'","\\'");
    var astValues = szValue.split('|');
    for(var i=0; i!=astFilters.length; ++i){
        if(astFilters[i].length > 0){
            szWhere += " or " + astFilters[i] +" like '%"+astValues[i] + "%'"; 
        }
    }
    if(typeof szOrder != "undefined" && szOrder.length > 0){
        szWhere += ") order by " + szOrder;
    }
    return szWhere;
};

var _ = {};
_.getSql = function(sqlIndex, params, cb, format_custom){
    var szSql = sqls[sqlIndex];
    if(typeof szSql == 'undefined'){
        if(cb){
            cb("sqlIndex undefined:"+sqlIndex);
        }
        return;
    }
    szSql = format(szSql, params);
    if(typeof format_custom == 'function'){
        szSql = format_custom(szSql, params);
    }
    return szSql;
};

_.excute = function(szSql, inst, cb,sqlIndex){
    var tStart = Date.now();
    inst.query(szSql, function(err, rows, field){
        var tUsed = Date.now() - tStart;
        console.info(sqlIndex + ": " + szSql + " " + tUsed + " ms");
        if(err){
            console.error('excute %s error %s', szSql, JSON.stringify(err));
        }
        if(cb){
            cb(err, rows, field);
        }
        const logObj = {
            l1 : sqlIndex,
            l2 : szSql,
            l3 : tUsed,
            l4 : (err ? err.errno : 0)
        };
    });
};

var getSql = function(sqlIndex, params){
    var szSql = _.getSql(sqlIndex, params);
    if(sqlIndex < 5000){
        szSql = "select "+szSql;
    } else if(sqlIndex >= 5000 && sqlIndex<10000){
        szSql = "update "+szSql;
    } else if(sqlIndex >=10000 && sqlIndex < 15000){
        szSql = "insert "+szSql;
    } else if(sqlIndex >=15000 && sqlIndex < 20000){
        szSql = "delete "+szSql;
    }else if(sqlIndex >= 20000 && sqlIndex < 25000){
        szSql = "replace "+szSql;
    }
    return szSql;
};

var tableDbIndex = require('./sql_define').tableDbIndex;

_.getDbIndex = function(szSql,iIndex) {
    var parseStr = (szSql+" ").trim().replace(/[\*\(\,]/g,' ');
    parseStr = parseStr.replace(/INTO/g,'into');
    parseStr = parseStr.replace(/FROM/g,'from');
    var tokens = parseStr.split(/\s+/);
    var preIdx = -1;
    if (iIndex >= 5000 && iIndex < 10000) {
        //update 直接取第一个token作为表名
    } else {
        if((iIndex >= 10000 && iIndex < 15000) || (iIndex >= 20000 && iIndex < 25000)) {
            preIdx = underscore.indexOf(tokens,'into'); //insert 和 replace 搜索 into的下一个
        }else {
            preIdx = underscore.lastIndexOf(tokens,'from'); //select delete 搜索 from的下一个
        }
        if (preIdx === -1) { console.error('### error parse sql %s',szSql); }
    }
    var tbTableName = tokens[preIdx + 1];
    var iSplitIdx = tbTableName.lastIndexOf('_');
    if (iSplitIdx > -1) { tbTableName = tbTableName.substring(0,iSplitIdx); }
    var dbIdx = tableDbIndex[tbTableName];
    if (dbIdx && dbArray[dbIdx]) {
        console.log("table %s use dbIndex %d",tbTableName,dbIdx);
        return dbIdx;
    }else{
        return dbIndex.dbDefault;
    }
};

//cb:function(err, conn)
// format_custom:可选参数 function(szSql, params)
// iDbType : 可选参数，指定要使用的数据库类型（sqlPool.dbTypeEnum）
var excute = function(sqlIndex, params, cb, format_custom, iDbType){
    var szSql = _.getSql(sqlIndex, params, cb, format_custom);
    var iIndex = parseInt(sqlIndex);
    var dbIndex = _.getDbIndex(szSql,iIndex);
    var curPool = dbArray[dbIndex].readPool;
    if(iIndex < 5000){
        szSql = "select "+szSql;
        curPool = dbArray[dbIndex].readPool;
    } else if(iIndex >= 5000 && iIndex<10000){
        szSql = "update "+szSql;
        curPool = dbArray[dbIndex].writePool;
    } else if(iIndex >=10000 && iIndex < 15000){
        szSql = "insert "+szSql;
        curPool = dbArray[dbIndex].writePool;
    } else if(iIndex >=15000 && iIndex < 20000){
        szSql = "delete "+szSql;
        curPool = dbArray[dbIndex].writePool;
    } else if(iIndex >= 20000 && iIndex < 25000){
        szSql = "replace "+szSql;
        curPool = dbArray[dbIndex].writePool;
    } else if(iIndex >= 25000 && iIndex < 30000){
        var cmdStr = szSql.substr(0, 6);
        if (cmdStr.toLowerCase() !== 'select') {
            return;
        }
        curPool = dbArray[dbIndex].readPool;
    } else {
        return;
    }

    if ( iDbType && ((iIndex < 5000) || (iIndex >= 25000 && iIndex < 30000)) ) {
        // 有传入该参数，且是读类型的sql，则在真正执行前，校正要使用的pool
        switch (iDbType) {
            case sqlPool.dbTypeEnum.dbType_slave:
                // 要走从库
                if (dbArray[dbIndex].slavePool) {
                    console.log("sqlIndex:%d ---> using slaveDB", iIndex);
                    curPool = dbArray[dbIndex].slavePool;
                } else {
                    return;
                }
                break;

            default :
                return;
        }
    }
    _.excute(szSql, curPool, cb,sqlIndex);
};

var excute_conn = function(sqlIndex, params, cb, format_custom){
    var szSql = _.getSql(sqlIndex, params, cb, format_custom);
    var iIndex = parseInt(sqlIndex);
    if(iIndex < 5000){
        szSql = "select "+szSql;
    } else if(iIndex >= 5000 && iIndex<10000){
        szSql = "update "+szSql;
    } else if(iIndex >=10000 && iIndex < 15000){
        szSql = "insert "+szSql;
    } else if(iIndex >=15000 && iIndex < 20000){
        szSql = "delete "+szSql;
    }else if(iIndex >= 20000 && iIndex < 25000){
        szSql = "replace "+szSql;
    }else{
        return;
    }
    _.excute(szSql, this.conn, cb,sqlIndex);
};


//cb:function(conn, callback) callback:function(err) err不为null表示需要回滚 
var beginTrans = function(cb, cb2,iDBIndex){
    var connInst = {};
    connInst.format = format;
    connInst.filter = filter;
    connInst.orfilter = orfilter;
    connInst.excute = excute_conn;
    iDBIndex = iDBIndex || dbIndex.dbDefault;
    console.log('start trans use %d dbIndex',iDBIndex);
    dbArray[iDBIndex].writePool.getConnection(function(err, conn){
        if(err){
            console.error("fail to beginTrans %s", err);
            cb(null);
        }else{
            connInst.conn = conn;
            conn.beginTransaction(function(err){
                if(err){
                    cb(null, null);
                    if(cb2) cb2(err);
                    return;
                }
                cb(connInst, function(err){
                    if(err){
                        console.error('begin to rollback');
                        conn.rollback(function(){
                            if(cb2) cb2(err);
                            conn.release();
                        });
                    }else{
                        conn.commit(function(err){
                            if(err){
                                conn.rollback(function(){
                                    if(cb2) cb2(err);
                                    conn.release();
                                });
                            }else{
                                    if(cb2) cb2(err);
                                conn.release();
                            }
                        });
                    }
                });
            });
        }
    });
};


sqlPool.beginTrans = beginTrans;
sqlPool.format = format;
sqlPool.filter = filter;
sqlPool.orfilter = orfilter;
sqlPool.excute = excute;
sqlPool.getSql = getSql;
module.exports = sqlPool;
