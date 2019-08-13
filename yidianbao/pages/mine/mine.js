//logs.js
const { request } = require('../../utils/util.js'),
    app = getApp()

Page({
    data: {
		unregistered: false,
        userInfo: {},
		userDetail: {},
        hasUserInfo: false
    },

    onLoad() {
		wx.showLoading({ title: '加载中', mask: true })
		// this.getUserInfo()
    },

	onShow () {
		this.getDetail()
		wx.getStorage({
			key: 'hasReg',
			success: res => {
				if (0 === res.data) this.setData({
					unregistered: true
				})
			}
		})
	},

	getUserInfo () {
		if (app.globalData.userInfo) {
			this.setData({
				userInfo: app.globalData.userInfo,
				hasUserInfo: true
			})
		} else {
			// wx.getUserInfo({
			// 	success: res => {
			// 		app.globalData.userInfo = res.userInfo
			// 		this.setData({
			// 			userInfo: res.userInfo,
			// 			hasUserInfo: true
			// 		})
			// 	},
			// })
		}
	},

	getDetail () {
		request('GETdetail', {}, res => {
			wx.hideLoading()
			this.setData({
				userDetail: res.data.body
			})
		})
	}
})
