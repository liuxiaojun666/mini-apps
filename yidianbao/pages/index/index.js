const { request, getShortDistance, progressThan, openMap, getDateDiff } = require('../../utils/util.js'),
        app = getApp()

Page({
    data: {
		isRegister: true,
        cds: 0,
        hb: 0,
        jf: 0,
		list: []
    },

    grabSingle(e) {
		wx.showLoading({ title: '抢单中', mask: true })
		request('doGrab', { id: e.currentTarget.dataset.id }, res => {
			if (res.data.code !== 0) return
			wx.showToast({ title: '抢单成功' })
			this.data.pageIndex = 0
			this.data.list = []
			this.getSelectPage()
			this.getSimpleInfo()
		})
    },

    openMap (e) {
		const { latitude, longitude } = e.currentTarget.dataset
		openMap(latitude, longitude)
	},

    onPullDownRefresh() {
		this.data.pageIndex = 0
		this.data.list = []
		this.getSelectPage()
		this.getSimpleInfo()
        wx.stopPullDownRefresh()
    },

	onReachBottom () {
		if (this.data.totalPage <= this.data.pageIndex + 1) return
		this.getSelectPage(++this.data.pageIndex)
	},


	getLocation () {
		wx.getLocation({
			type: 'gcj02',
			success: res => {
				const { latitude, longitude } = res
				this.setData({ latitude, longitude })
				wx.setStorage({ key: "latitude", data: latitude })
				wx.setStorage({ key: "longitude", data: longitude })
				this.data.list.forEach(v => {
					if (v.distance !== 'NaN') return
					v.distance = (getShortDistance(v.longitude, v.latitude, longitude, latitude) / 1000).toFixed(2)
				})
				this.setData({ list: this.data.list })
			},
			fail(res) {
				wx.openSetting()
			},
		})
	},

	getSelectPage(pageIndex = 0) {
		wx.showLoading({ title: '加载中', mask: true })
		request('GETselectPage', { pageIndex }, res => {
			wx.hideLoading()
			if (res.msg === '未注册') return this.setData({ isRegister: false })
			this.setData({
				totalPage: res.data.body.totalPage,
				list: [...this.data.list, ...res.data.body.data.map(v => {
					const { publishStatus, id, bounsFinal, taskNo, distDate, provinceName, cityName, countyName, address, taskTitle, taskContent, longitude, latitude, bounsTime, bounsTime1, bounsTime2, bounsTime3, handleTime, bouns1, bouns2, bouns3 } = v, bounsTimeArr = [bounsTime1, bounsTime2, bounsTime3]
					return {
						publishStatus, id, bounsFinal, taskNo, provinceName, cityName, countyName, address, taskTitle, taskContent, longitude, latitude,
						// distDate: new Date(distDate).Format('yyyy-MM-dd hh:mm'),
						distDate: getDateDiff(distDate),
						progressThan: publishStatus === '07' ? progressThan(distDate, bounsTime1, bounsTime2, bounsTime3, handleTime) : progressThan(distDate, bounsTime1, bounsTime2, bounsTime3),
						distance: (getShortDistance(this.data.longitude, this.data.latitude, longitude, latitude) / 1000).toFixed(2),
						bounsTimeArr: bounsTimeArr.reduce((a, b, i) => b ? a.concat({ time: new Date(b).Format('yyyy-MM-dd hh:mm'), bouns: v['bouns' + (i + 1)] }) : a, [])
					}
				})]
			})
		})
	},

	getSimpleInfo () {
		request('GETgetSimpleInfo', {}, res => {
			if (res.msg === '未注册') return this.setData({ isRegister: false })
			const { data: { body: { tasks: cds, bouns: hb, points: jf } } } = res
			this.setData({ cds, hb, jf })
		})
	},

	onShow() {
		this.data.pageIndex = 0
		this.data.list = []
		this.getSelectPage()
		this.getSimpleInfo()
    },

	onLoad () {
		this.getLocation()
	}

})
