const { request, uploadFile, getShortDistance, progressThan, openMap, getDateDiff } = require('../../utils/util.js'), { baseUrl } = require('../../utils/interface.js'),
	app = getApp()

Page({
    data: {
        imgUrls: [],
		showTaskSchedule: false,
    },

	grabSingle(e) {
		wx.showLoading({ title: '抢单中', mask: true })
		const id = e.currentTarget.dataset.id
		request('doGrab', { id }, res => {
			if (res.data.code !== 0) return
			wx.showToast({ title: '抢单成功' })
			this.getTaskDetail(id)
		})
	},

	getTaskDescription (e) {
		this.setData({ content: e.detail.value })
	},

	save (e) {
		this.saveOrSubmit(0)
	},
	submit(e) {
		this.saveOrSubmit(1)
	},

	saveOrSubmit(opType, id = this.data.id) {
		const self = this
		if (this.data.imgUrls.length > 9) this.data.imgUrls.length = 9
		wx.showLoading({ title: '正在上传...', mask: true, })
		let certifys = []
		this.data.imgUrls.forEach((v, i) => {
			if (v.includes('document')) {
				certifys.push(v.substr(baseUrl.length))
				if (certifys.length === this.data.imgUrls.length) uploadComplete()
				return
			}
			uploadFile('uploadFile', 'file', v, { classify: 'handler' }, res => {
				certifys = [...certifys, ...JSON.parse(res.data)]
				if (certifys.length === this.data.imgUrls.length) uploadComplete()
			}, res => {
				wx.showToast({ title: '上传失败', mask: true, })
			})
		})
		if (0 === this.data.imgUrls.length) uploadComplete()
		function uploadComplete() {
			request('doHandle', {
				id, opType, content: self.data.content, imgJson: certifys.join(',')
			}, res => {
				if (res.data.code === 0) self.getTaskDetail(id)
			})
		}
	},

    delImg (e) {
        const { imgUrls } = this.data
        imgUrls.splice(e.currentTarget.dataset.index, 1)
        this.setData({ imgUrls })
    },
    chooseImg () {
        wx.chooseImage({
            success: res => {
                this.setData({ imgUrls: this.data.imgUrls.concat(res.tempFilePaths) })
            }
        })
    },

	getTaskDetail(id) {
		wx.showLoading({ title: '加载中', mask: true })
		request('GETtaskDetail', { id }, resp => {
			wx.hideLoading()
			const { data: { body: res } } = resp
			res.progressThan = res.publishStatus === '07' ? progressThan(res.distDate, res.bounsTime1, res.bounsTime2, res.bounsTime3, res.handleTime) : progressThan(res.distDate, res.bounsTime1, res.bounsTime2, res.bounsTime3)
			res.distDate = getDateDiff(res.distDate)
			// res.distDate = new Date(res.distDate).Format('yyyy-MM-dd hh:mm')
			res.handleTime = res.handleTime && new Date(res.handleTime).Format('yyyy.MM.dd hh:mm')
			res.reviewTime = res.reviewTime && new Date(res.reviewTime).Format('yyyy.MM.dd hh:mm')
			res.handleGrabTime = res.handleGrabTime && new Date(res.handleGrabTime).Format('yyyy.MM.dd hh:mm')
			res.bounsTime = res.bounsTime && new Date(res.bounsTime).Format('yyyy.MM.dd hh:mm')
			res.distance = (getShortDistance(res.longitude, res.latitude, wx.getStorageSync('longitude'), wx.getStorageSync('latitude')) / 1000).toFixed(2)
			res.bounsTimeArr = [res.bounsTime1, res.bounsTime2, res.bounsTime3].reduce((a, b, i) => b ? a.concat({ time: new Date(b).Format('yyyy-MM-dd hh:mm'), bouns: res['bouns' + (i + 1)] }) : a, [])
			this.setData({ res, imgUrls: res.handleImg ? res.handleImg.split(',').map((v => baseUrl + '/' + v)) : [] })
			if (['02', '03', '04', '05', '06', '07'].includes(res.publishStatus)) this.setData({ showTaskSchedule: true })
		})
	},

    onLoad (options) {
		const { id } = options
		this.getTaskDetail(id)
		this.setData({ id })
    }
})