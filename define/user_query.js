"use strict"

const joi = require('joi');   // 参数校验 https://github.com/hapijs/joi

const user_query = [
    {
	//添加教师
	router : "/user/teacher/add",
	params : {
	    szName : joi.string().required(),
	    szHeadUrl: joi.string().required(),
	    szSignature : joi.string().required(),
	    szArea : joi.string().required(),
	    iPrice : joi.number().integer().required(),
	    szType : joi.string().required(),
	    szPhone : joi.string().required(),
	    szFreeTime : joi.string().required(),
	},
	access : 0,
    },
    {
	//查看教师
	router : "/user/teacher/list",
	params : {
	    iPageSize : joi.number().integer().required(),
	    iPageNum : joi.number().integer().required()
	},
	access : 0,
    },
];

module.exports = user_query;
