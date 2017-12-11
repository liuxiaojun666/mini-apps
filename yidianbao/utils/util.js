const { api, noRegisterApi, baseUrl } = require('./interface.js')

const unsentXhr = []

let logging = false

Date.prototype.Format = function (fmt) {
	const o = { "M+": this.getMonth() + 1, "d+": this.getDate(), "h+": this.getHours(), "m+": this.getMinutes(), "s+": this.getSeconds(), "q+": Math.floor((this.getMonth() + 3) / 3), "S": this.getMilliseconds() }
	if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length))
	for (let k in o) if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)))
	return fmt
}

const getDateDiff = dateTimeStamp => {
	const minute = 1000 * 60, hour = minute * 60, day = hour * 24, halfamonth = day * 15, month = day * 30, now = new Date().getTime(), diffValue = now - dateTimeStamp;
	if (diffValue < 0) return
	const monthC = diffValue / month, weekC = diffValue / (7 * day), dayC = diffValue / day, hourC = diffValue / hour, minC = diffValue / minute
	let result = ''
	if (monthC >= 1) result += parseInt(monthC) + "月前"
	else if (weekC >= 1) result += parseInt(weekC) + "周前"
	else if (dayC >= 1) result += parseInt(dayC) + "天前"
	else if (hourC >= 1) result += parseInt(hourC) + "小时前"
	else if (minC >= 1) result += parseInt(minC) + "分钟前" 
	else result += "刚刚"
	return result
}

const progressThan = (...arg) => {
	const len = arg.length
	let progressThan = 0, activeIndex = len
	const stamp = arg.pop()
	arg.push(null)
	for (let i = 0; i < len; i++) {
		if (!arg[i + 1]) break
		if (arg[i + 2]) continue
		for (let index = 0; index < len; index++) {
			if (stamp < arg[index + 1]) {
				progressThan = ((index) / (i + 1)) + ((stamp - arg[index]) / (arg[index + 1] - arg[index]) / (i + 1))
				if ((progressThan > 0) && (progressThan < 1)) activeIndex = index
				break
			}
			progressThan = 1
		}
	}
	return { progressThan, activeIndex }
}

const getShortDistance = (lon1, lat1, lon2, lat2) => {
	const DEF_PI = 3.14159265359, DEF_2PI = 6.28318530712, DEF_PI180 = 0.01745329252, DEF_R = 6370693.5
	let ew1 = lon1 * DEF_PI180, ns1 = lat1 * DEF_PI180, ew2 = lon2 * DEF_PI180, ns2 = lat2 * DEF_PI180, dew = ew1 - ew2, dx, dy
	if (dew > DEF_PI) dew = DEF_2PI - dew
	else if (dew < -DEF_PI) dew = DEF_2PI + dew
	dx = DEF_R * Math.cos(ns1) * dew
	dy = DEF_R * (ns1 - ns2)
	return Math.sqrt(dx * dx + dy * dy).toFixed(0)
}

const openMap = (latitude, longitude) => {
	wx.openLocation({ latitude, longitude, scale: 15, })
}

const uploadFile = (url, name, filePath, formData = {}, success = () => { }, fail = () => { }, complete = () => { }) => {
	const sessionId = wx.getStorageSync('sessionId'), hasReg = wx.getStorageSync('hasReg'), goLogin = () => {
		unsentXhr.push(() => uploadFile(url, name, filePath, formData, success, fail, complete))
		login()
	}

	if (!sessionId) return goLogin()
	if (hasReg === 0 && !noRegisterApi.includes(url)) return success({ msg: '未注册' })
	else if ((hasReg !== 1) && (hasReg !== 0)) return goLogin()

	return wx.uploadFile({
		url: api[url], filePath, name,
		header: { 'wxa-sessionid': sessionId, "content-type": "multipart/form-data" },
		formData,
		success(...arg) {
			const { data: { code, msg } } = arg[0]
			if (code === 1) {
				if (msg.includes('wxa_session')) return goLogin()
				else wx.showToast({ title: '服务器错误', icon: 'loading' })
				return { msg }
			}
			success(...arg)
		}, fail(...arg) {
			wx.showToast({ title: '服务器错误', icon: 'loading' })
			fail(...arg)
		}, complete,
	})
}

const uploadFun = (v, i, certifys, classify, self, allUploadComplete) => {
	if (v.includes('document')) {
		certifys.push(v.substr(baseUrl.length + 1))
		return uploadComplete()
	}

	let uploadTask = uploadFile('uploadFile', 'file', v, { classify }, res => {
		certifys = [...certifys, ...JSON.parse(res.data)]
	}, () => { certifys.push('') }, uploadComplete)

	uploadTask.onProgressUpdate(res => {
		wx.showLoading({ title: (i + 1) + '/' + self.data.imgUrls.length + '\n' + res.progress + '%', mask: true })
	})

	function uploadComplete() {
		if (certifys.length === self.data.imgUrls.length) return allUploadComplete(certifys)
		uploadFun(self.data.imgUrls[i + 1], i + 1, certifys, classify, self, allUploadComplete)
	}
}

const request = (url, data = {}, success = () => { }, fail = () => { }, complete = () => { }) => {
	const sessionId = wx.getStorageSync('sessionId'), hasReg = wx.getStorageSync('hasReg'), goLogin = () => {
		unsentXhr.push(() => request(url, data, success, fail, complete))
		return login()
	}

	if (!sessionId) return goLogin()
	if (hasReg === 0 && !noRegisterApi.includes(url)) return success({ msg: '未注册' })
	else if ((hasReg !== 1) && (hasReg !== 0)) return goLogin()

	const method = url.startsWith('GET') ? 'GET' : 'POST'
	let header = { 'wxa-sessionid': sessionId, "X-Requested-With": "XMLHttpRequest" }
	if (method === 'POST') header = { ...header, "Content-Type": "application/x-www-form-urlencoded" }

	return wx.request({
		url: api[url], data, header, method, dataType: 'json',
		success(...arg) {
			const { data: { code, msg } } = arg[0]
			if (code === 500) return wx.showToast({ title: '服务器错误', icon: 'loading' })
			if (code === 1) {
				if (msg.includes('wxa_session')) return goLogin()
				else wx.showToast({ title: '服务器错误', icon: 'loading' })
				return { msg }
			}
			success(...arg)
		}, fail(...arg) {
			wx.showToast({ title: '服务器错误', icon: 'loading' })
			fail(...arg)
		}, complete,
	})
}

function login() {
	if (logging) return
	logging = true
	wx.login({
		success(res) {
			wx.request({
				url: api.login,
				data: { code: res.code },
				header: {
					"Content-Type": "application/x-www-form-urlencoded",
					"X-Requested-With": "XMLHttpRequest"
				},
				method: 'POST', dataType: 'json',
				success(res) {
					if (res.data.code !== 0) return wx.showToast({ title: '服务器错误', icon: 'loading' })
					const { data: { body: { sessionId, hasReg } } } = res
					wx.setStorageSync('sessionId', sessionId)
					wx.setStorageSync('hasReg', hasReg)
					unsentXhr.forEach(xhr => xhr())
					unsentXhr.length = 0
				},
				complete() { logging = false }
			})
		}
	})
}

module.exports = {
	getDateDiff,
	openMap,
	progressThan,
	uploadFile,
	uploadFun,
	request,
	login,
	getShortDistance
}