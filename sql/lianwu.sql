#create database dbLianwu;

create table IF NOT EXISTS tbTeacher(
    iTID bigint unsigned not null auto_increment comment '教师ID',
    szName varchar(256) default '' comment '教师名字',
    szHeadUrl varchar(1024) default '' comment '头像url',
    szSignature varchar(1024) default '' comment '个性签名',
    iScore int unsigned default 0 comment '教师评分',
    szArea varchar(1024) default '' comment '居住地区',
    iLabel int unsigned default 0 comment '标签',
    iPrice int unsigned default 0 comment '价格',
    szType varchar(1024) default '' comment '',
    szPhone varchar(256) default '' comment '联系电话',
    szFreeTime varchar(512) default '' comment '空闲时间',
    dtRegisterTime datetime not null default '1970-01-01 00:00:00' comment '开始日期',
    primary key (`iTID`)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 comment="教师表";

create table IF NOT EXISTS tbSchool(
    iSID bigint unsigned not null auto_increment comment '学校ID',
    szName varchar(256) default '' comment '学校名字',
    szHeadUrl varchar(1024) default '' comment '学校头像',
    szContactsName varchar(256) default '' comment '联系人姓名',
    szContactsWe varchar(256) default '' comment '联系人微信号',
    szContactsPhone varchar(256) default '' comment '联系人电话',
    szContactsMail varchar(512) default '' comment '联系人邮箱',
    szSchoolDesc varchar(1024) default '' comment '学校描述',
    szArea varchar(1024) default '' comment '学校地址',
    szType varchar(1024) default '' comment '舞种',
    szCourseTime varchar(1024) default '' comment '上课时间',
    dtRegisterTime datetime not null default '1970-01-01 00:00:00' comment '开始日期',
    primary key (`iSID`)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 comment="学校表";
