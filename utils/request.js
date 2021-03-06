/**
 * 网络请求模块
 * @Auther Cphayim
 */

import { toast, modal } from './layer.js'
import { queryString } from '../utils/url.js'
import config from '../config.js'

/**
 * 发送 http 请求
 * @function request
 * @param {object} opts 解构配置项
 * @param {string} opts.url 请求路径
 * @param {string} opts.method 请求方法 [default = 'POST']
 * @param {object} opts.header 请求头 [default = {}]
 * @param {object} opts.data 请求数据 [default = {}]
 * @param {boolean} opts.hasSession 请求头是否携带 sessionId [default = true]
 * @return Promise.state
 */
export function request({
  url,
  method = 'POST',
  header = {},
  data = {},
  hasSession = true
}) {
  header['appId'] = wx.getExtConfigSync().appid || ''
  header['X-Requested-With'] = 'XMLHttpRequest'
  /****/
  header['tenantId'] = wx.getExtConfigSync().tenantId || ''
  /****/

  if (hasSession) {
    header['sessionId'] = wx.getStorageSync('session_id') || ''
  }

  /****/
  url += (url.indexOf('?') === -1 ? '?' : '&') + 'resultType=jsonapi'
  /****/

  return new Promise((resolve, reject) => {
    wx.request({
      url,
      method,
      data,
      header,
      dataType: 'json',
      success: res => resolve(res),
      fail: err => reject(err)
    })
  }).then(res => {
    // 判断响应状态码是否为200
    if (res.statusCode === 200) {

      // 判断服务端 jsonapi 返回的 errorcode 是否正确
      if (res.data && res.data.errorcode === config.ERR_OK_CODE) {
        return Promise.resolve(res.data)
      } else {
        const data = res.data || {}
        const { errorcode, errormsg } = data

        return Promise.reject({
          errorcode,
          errormsg
        })
      }

    } else {
      return Promise.reject({
        status: res.statusCode,
        errormsg: `请求失败，HTTP状态码: ${res.statusCode}`
      })
    }
  }).catch(err => {
    /**
     * catch 住所有异常的请求
     * (请求失败、返回状态码异常、data.errorcode 异常)
     * 并返回一个 rejected 状态的 Promise 实例
     */
    const errormsg = err.errormsg || '请求失败，请检查网络'

    /****/
    if (err.errorcode === 40003) { // 重新登录
      modal.alert({
        content: '登录状态过期'
      }).then(() => {
        const currentPages = getCurrentPages()
        const currentPage = currentPages[currentPages.length - 1]
        const url = '/' + currentPage.route + queryString(currentPage.options)
        // 清除 session
        wx.removeStorageSync('session_id')
        // 重定向到当前页面
        wx.redirectTo({ url })
      })
    } else { // 弹框提示
      modal.alert({ content: errormsg })
    }
    return Promise.reject(err)
    /****/
  })
}