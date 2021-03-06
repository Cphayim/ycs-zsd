// pages/home/home.js

/**
 * 首页
 * @Category 业务页
 * @Author Cphayim
 */
import config from '../../config.js'
import Auth from '../../service/auth.js'
import {
  getBannerList,
  getTopGoodsList,
  getDealerInfo
} from '../../service/home.js'
import { toast, modal } from '../../utils/layer.js'

Page({
  pageName: 'home',
  /**
   * 页面的初始数据
   */
  data: {
    bannerList: [],
    topGoodsList: [],
    dealerInfo: {}
  },

  /**
   * 初始化页面
   * @private
   * @method _init
   */
  _init(isRefresh = false) {
    wx.setNavigationBarTitle({
      title: wx.getExtConfigSync().tenantName || ''
    })
    isRefresh || toast.loading()
    const arr = [this._getBannerList(), this._getTopGoodsList(), this._getDealerInfo()]
    return Promise.all(res => toast.hide())
      .catch(err => toast.hide())
  },

  /**
   * 获取首页轮播图数据
   * @private
   * @method _getBannerList
   */
  _getBannerList() {
    return getBannerList()
      .then(res => {
        const { data } = res
        const bannerList = data.map((item, index) => {
          return {
            id: item.Id,
            title: item.Title,
            imgUrl: item.TitleImg,
            // 路由跳转
            route: `${config.pageOpt.getPageUrl('store-detail')}?id=${item.FromId}`
          }
        })
        this.setData({ bannerList })
      })
  },

  /**
   * 获取首页热卖商城 Top 数据
   * @private
   * @method _getTopGoodsList
   */
  _getTopGoodsList() {
    return getTopGoodsList()
      .then(res => {
        const { data } = res
        this.setData({
          topGoodsList: data
        })
      })
  },

  /**
   * 获取经销商信息
   * @private
   * @method _getDealerInfo
   */
  _getDealerInfo() {
    return getDealerInfo()
      .then(res => {
        const { data } = res
        this.setData({
          dealerInfo: data
        })
      })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 判断是否是从 web-view 跳转而来
    if (options.wxopenid) {
      wx.setStorageSync('wxopenid', options.wxopenid)
    }
    if (config.pageOpt.getNeedAuth(this.pageName)) {
      const auth = new Auth()
      auth.validate()
        .then(res => this._init())
    } else {
      this._init()
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    setTimeout(() => {
      this._init(true).then(res => wx.stopPullDownRefresh())
    }, config.refreshDelay)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: wx.getExtConfigSync().tanantName,
      path: config.pageOpt.getShareUrl(this.pageName)
    }
  }
})