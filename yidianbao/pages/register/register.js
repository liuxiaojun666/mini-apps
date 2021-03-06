const { request } = require('../../utils/util.js'), app = getApp()
Page({
    data: {
        phoneNumber: '',
        code: '',
		notLocation: false,
		isGetCode: false
    },
    inputNumber(e) {
        this.setData({
            phoneNumber: e.detail.value
        })
    },
    getCode () {
        if (!/^(0|86|17951)?1[0-9]{10}$/.test(this.data.phoneNumber)) return wx.showToast({ title: '请检查手机号', icon: 'loading', })
		if (this.data.isGetCode) return
		this.data.isGetCode = true
		request('register', { phone: this.data.phoneNumber }, res => {
			this.data.isGetCode = false
			if (res.data.code === 2) {
				wx.showToast({ title: '发送成功' })
				this.setData({ Registering: 60 })
				const timer = () => setTimeout(() => {
					if (0 === this.data.Registering) return
					this.setData({ Registering: --this.data.Registering })
					timer()
				}, 1000)
				timer()
			} else if (res.data.code === 1) {
				wx.showToast({ title: res.data.msg, icon: 'loading' })
			}
		})
    },
    inputCode(e) {
        this.setData({ code: e.detail.value })
    },

	register () {
		wx.showLoading({ title: '正在注册', mask: true, })
		request('register', {
			phone: this.data.phoneNumber,
			randomCode: this.data.code,
			// latitude: this.data.latitude,
			// longitude: this.data.longitude
		}, res => {
			if (res.data.code !== 0) return
			wx.setStorageSync('hasReg', 1)
			wx.showToast({ title: res.data.msg, mask: true, success () {
					setTimeout(() => { wx.reLaunch({ url: '../index/index' }) }, 1500)
				}
			})
		})
	},

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
		// this.getLocation()
    },

	/**
	 * 获取用户地理位置
	 */
	// getLocation () {
	// 	wx.getLocation({
	// 		type: 'gcj02',
	// 		success: res => {
	// 			this.setData({
	// 				latitude: res.latitude,
	// 				longitude: res.longitude
	// 			})
	// 		},
	// 		fail: res => {
	// 			this.setData({
	// 				notLocation: true
	// 			})
	// 		},
	// 	})
	// },

	/**
	 * 打开用户授权设置
	 */
	// openSetting () {
	// 	wx.openSetting({
	// 		success: res => {
	// 			if (res.authSetting["scope.userLocation"]) {
	// 				this.setData({
	// 					notLocation: false
	// 				})
	// 				// this.getLocation()
	// 			}
	// 		}
	// 	})
	// },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})