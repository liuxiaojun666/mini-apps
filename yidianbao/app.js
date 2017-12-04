const { request } = require('utils/util.js')
App({
    onLaunch: function () {
        // 获取用户信息
        wx.getSetting({
            success: res => {
                wx.getUserInfo({
                    success: res => {
                        this.globalData.userInfo = res.userInfo
                    }
                })
            },
            fail() {
                wx.openSetting()
            }
        })

        
    },
    globalData: {
        userInfo: null,
    },
})