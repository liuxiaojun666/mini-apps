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
    
	/**
	 * 页面加载
	 */
    onLoad() {
		this.getUserInfo()
		this.getDetail()
    },

	/**
     * 生命周期函数--监听页面显示
     */
	onShow () {
		wx.getStorage({
			key: 'hasReg',
			success: res => {
				if (0 === res.data) this.setData({
					unregistered: true
				})
			}
		})
	},

	/**
	 * 获取用户信息
	 */
	getUserInfo () {
		if (app.globalData.userInfo) {
			this.setData({
				userInfo: app.globalData.userInfo,
				hasUserInfo: true
			})
		} else {
			wx.getUserInfo({
				success: res => {
					app.globalData.userInfo = res.userInfo
					this.setData({
						userInfo: res.userInfo,
						hasUserInfo: true
					})
				},
			})
		}
	},

	/**
	 * 查询人员基本信息
	 */
	getDetail () {
		request('GETdetail', {}, res => {
			this.setData({
				userDetail: res.data.body
			})
		})
	}
})
