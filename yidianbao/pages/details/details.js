const { request, uploadFun, getShortDistance, progressThan, openMap, getDateDiff } = require('../../utils/util.js'), { baseUrl } = require('../../utils/interface.js'),
	app = getApp()

Page({
    data: {
        imgUrls: [],
		showTaskSchedule: false,
    },

	grabSingle(e) {
		wx.showLoading({ title: '抢单中', mask: true })
		const { id } = this.data
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
		wx.showModal({
			title: '提交',
			content: '是否确定提交审核',
			success: res => {
				if (res.confirm) this.saveOrSubmit(1)
				else if (res.cancel) return
			}
		})
	},

	saveOrSubmit(opType, id = this.data.id) {
		if (this.data.imgUrls.length > 9) this.data.imgUrls.length = 9
		wx.showLoading({ title: '正在上传...', mask: true, })
		const allUploadComplete = certifys => {
			request('doHandle', { id, opType, content: this.data.content, imgJson: certifys.join(',') }, res => {
				this.getTaskDetail(id)
			})
		}
		this.data.imgUrls[0] && uploadFun(this.data.imgUrls[0], 0, [], 'handler', this, allUploadComplete)
		if (0 === this.data.imgUrls.length) allUploadComplete([])
	},

    delImg (e) {
        const { imgUrls } = this.data
        imgUrls.splice(e.currentTarget.dataset.index, 1)
        this.setData({ imgUrls })
    },
	previewImage(e) {
		const { src, imgarrname: imgArrName } = e.currentTarget.dataset
		wx.previewImage({
			current: src,
			urls: this.data[imgArrName]
		})
	},
    chooseImg () {
        wx.chooseImage({
            success: res => {
                this.setData({ imgUrls: this.data.imgUrls.concat(res.tempFilePaths) })
            }
        })
    },

	makePhoneCall (e) {
		wx.makePhoneCall({ phoneNumber: e.currentTarget.dataset.phone })
	},

	getTaskDetail(id) {
		wx.showLoading({ title: '加载中', mask: true })
		request('GETtaskDetail', { id }, resp => {
			wx.hideLoading()
			const { data: { body: res } } = resp
			res.progressThan = progressThan(res.distDate, res.bounsTime1, res.bounsTime2, res.bounsTime3, ['04', '05', '07'].includes(res.publishStatus) ? res.handleTime : +new Date)
			res.distDate = getDateDiff(res.distDate)
			res.handleTime = res.handleTime && new Date(res.handleTime).Format('yyyy.MM.dd hh:mm')
			res.reviewTime = res.reviewTime && new Date(res.reviewTime).Format('yyyy.MM.dd hh:mm')
			res.handleGrabTime = res.handleGrabTime && new Date(res.handleGrabTime).Format('yyyy.MM.dd hh:mm')
			res.bounsTime = res.bounsTime && new Date(res.bounsTime).Format('yyyy.MM.dd hh:mm')
			res.distance = (getShortDistance(res.longitude, res.latitude, wx.getStorageSync('longitude'), wx.getStorageSync('latitude')) / 1000).toFixed(2)
			res.bounsTimeArr = [res.bounsTime1, res.bounsTime2, res.bounsTime3].reduce((a, b, i) => b ? a.concat({ time: new Date(b).Format('yyyy-MM-dd hh:mm'), bouns: res['bouns' + (i + 1)] }) : a, [])
			res.reviewContent = JSON.parse(res.reviewContent || '[]').map(v => ({
				...v,
				time: new Date(v.time).Format('yyyy-MM-dd hh:mm:ss')
			}))
			this.setData({ 
				res, 
				content: res.handleContent, 
				imgUrls: res.handleImg ? res.handleImg.split(',').map((v => v && baseUrl + '/' + v)) : [],
				taskImgs: res.taskImgs ? res.taskImgs.split(',').map((v => v && baseUrl + '/' + v)) : []
			})
			if (['02', '03', '04', '05', '06', '07'].includes(res.publishStatus)) this.setData({ showTaskSchedule: true })
		})
	},

    onLoad (options) {
		const { id } = options
		this.getTaskDetail(id)
		this.setData({ id })
    }
})