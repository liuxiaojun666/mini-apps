const b = "https://jy.solway.cn"
// const b = 'https://necloud.solway.cn'
// const b = "http://192.168.10.219"
// const b = "http://192.168.10.60:88"
// const b = "http://172.10.1.11:9999"
// const b = 'http://192.168.10.161:8080/NECloud/'

exports.baseUrl = b

exports.noRegisterApi = ['register', 'GETdetail', 'GETgetSimpleInfo']

exports.api = {
	//登录  code
	login: b + '/wxa/user/login.htm',

	//wxa-sessionid *   pageIndex    pageSize
	GETselectPage: b + '/wxa/task/selectPage.htm',

	//用户注册 只输入手机号时，获取注册码；输入验证码则必须输入其他不能为空字段信息
	register: b + '/wxa/user/register.htm',

	//查询人员基本信息 小程序查询 sessionid必输；PC查询 人员ID、手机号必输
	GETdetail: b + '/wxa/user/detail.htm',

	//获取任务单、红包、积分信息
	GETgetSimpleInfo: b + '/wxa/user/getSimpleInfo.htm',

	//文件上传
	uploadFile: b + '/wxa/img.htm',

	//人员认证 登记个人认证信息  realName string    , cardId string,     certifys array 
	doAuth: b + '/wxa/user/doAuth.htm',

	//受理任务 抢单 id
	doGrab: b + '/wxa/task/doGrab.htm',

	//查询任务基本信息   任务详情
	GETtaskDetail: b + '/wxa/task/detail.htm',

	//处理任务   保存 or 提交   id   opType  操作类型 0 保存 1 完成   content    handleImg 处理图片json
	doHandle: b + '/wxa/task/doHandle.htm',



}
