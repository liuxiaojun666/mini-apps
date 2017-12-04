const app = getApp(), { request, uploadFile } = require('../../utils/util.js'), { baseUrl } = require('../../utils/interface.js')

Page({
    data: {
		userDetail: {},
        imgUrls: [],
        idNumber: '',
        userName: ''
    },
    submit () {
		const self = this
        if (false === this.nameVerification()) return
        if (false === this.idVerification()) return
		if (this.data.imgUrls.length < 1) return wx.showToast({ title: '请选择图片', icon: 'loading', mask: true, })
		wx.showLoading({ title: '正在上传...', mask: true, })
		let certifys = []
		this.data.imgUrls.forEach((v, i) => {
			if (v.includes('document')) return certifys.push(v.substr(baseUrl.length))
			uploadFile('uploadFile', 'file', v, { classify: 'card' }, res => {
				certifys = [...certifys, ...JSON.parse(res.data)]
				if (certifys.length === this.data.imgUrls.length) uploadComplete()
			}, res => {
				wx.showToast({ title: '上传失败', mask: true, })
			})
		})
		function uploadComplete() {
			request('doAuth', {
				realName: self.data.userName,
				cardId: self.data.idNumber.toLowerCase(),
				certifys: certifys.join(',')
			}, res => {
				if (res.data.code === 0) wx.showToast({ title: res.data.msg, mask: true, success() {
						setTimeout(() => { wx.reLaunch({ url: '../mine/mine' }) }, 1500)
					}
				})
			})
		}
    },
    nameVerification(e = { detail: { value: this.data.userName } }) {
        this.setData({ userName: e.detail.value })
        if (!/^([\u4E00-\u9FA5]){2,11}$/.test(e.detail.value)) {
            wx.showToast({ title: '姓名错误', icon: 'loading', })
            return false
        }
    },
    idVerification(e = { detail: { value: this.data.idNumber } }) {
        this.setData({ idNumber: e.detail.value })
        if (!/^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/.test(e.detail.value)) {
            wx.showToast({ title: '身份证号错误', icon: 'loading', })
            return false
        }
    },
    delImg(e) {
        const { imgUrls } = this.data
        imgUrls.splice(e.currentTarget.dataset.index, 1)
        this.setData({ imgUrls })
    },
    chooseImg() {
        wx.chooseImage({
            count: 1,
            success: res => {
                this.setData({ imgUrls: this.data.imgUrls.concat(res.tempFilePaths) })
            }
        })
    },
	onLoad(options) {
		this.setData({ status: options.status })
		if (['02', '03', '04'].includes(options.status)) {
			request('GETdetail', {}, res => {
				if (res.data.code !== 0) return
				const { data: { body } } = res, imgUrls = [body.certify1, body.certify2, body.certify3, body.certify4, body.certify5].map(v => {
					if (!v) return void 0
					return baseUrl + '/' + v
				}).reduce((a, b) => {
					if (b) return a.concat(b)
					return a
				}, [])
				this.setData({ userDetail: body, imgUrls })
			})
		}
	}
})