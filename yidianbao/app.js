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