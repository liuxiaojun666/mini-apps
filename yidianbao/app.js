const { login } = require('utils/util.js')
App({
    onLaunch () {
		wx.getStorage({
			key: 'sessionId',
			success (res) {
				if (!res.data) login()
			}
		})
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