const $common = require('../../utils/common.js');
const $api = require('../../utils/api.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // canIUse: wx.canIUse('button.open-type.getUserInfo'),
    Address: '', //地址
    bo_end:false
  },
  getAddress() {
    $common.loading('登录中...')
    //获取当前位置
    $common.getLocation()
      .then(res => $common.reverseGeocoder(res))
      .then(res => {
        this.setData({
          Address: res.result.address
        })
      })
  },
  //获取当前用户冻结状态
  // 参数：OpenId【】UserType【用户类型， 0：用户   1：客服】  返回值：FrozenState：0【正常】1【已冻结】
  GetUserFrozen() {
    let openid = wx.getStorageSync('openid')
    $common.request($api.GetUserFrozenState, {
        openId: openid,
        userType: 1
      })
      .then(res => {
        $common.hide()
      })
  },
  //获取手机号
  //【只有为true 的时候才进入下一个页面】  【（res=false时出现）errorType：2：用户不存在  3/-1   解码失败      -2：数据错误】
  getPhoneNumber(e) {
    $common.request($api.GetUserPhone, {
        openId: wx.getStorageSync('openid'),
        encryptedData: e.detail.encryptedData,
        iv: e.detail.iv,
        session_key: wx.getStorageSync('session_key'),
        New_session_key: wx.getStorageSync('New_session_key')
      })
      .then(res => {
        $common.hide()
        console.log(res)
        if (res.data.res) {
          wx.setStorageSync('number', res)
          this.setData({
            bo_end: true
          })
          setTimeout(() => {
            wx.reLaunch({
              url: '../Home/OnlineService/OnlineService'
            });
          }, 500);
        }else{
          if (res.data.errorType==2){
            wx.showToast({
              title: '用户不存在',
              icon: 'none',
            })
          } else if (res.data.errorType == -2){
            wx.showToast({
              title: '数据错误',
              icon: 'none',
            })
          }
        }
      })
  },
  //获取openid
  bindGetUserInfo(e) {
    // 获取code
    wx.login({
      success: res => {
        let code = res.code;
        $common.request($api.Getopenid, {
            code: code,
            userType: 1
          })
          .then(res => {
            $common.hide()
            wx.setStorageSync('openid', res.data.openid)
            /**
             * 因获取手机号session_key过期问题，解决方案
             * 存储两个session_key后台会循环验证
             * session_key必须有值，New_session_key可有可无
             */
            let session_key = wx.getStorageSync('session_key')
            let New_session_key = wx.getStorageSync('New_session_key')
            let data_session_key = res.data.session_key
            wx.setStorageSync('session_key', session_key ? New_session_key === data_session_key ? session_key : New_session_key : data_session_key)
            wx.setStorageSync('New_session_key', data_session_key)
            this.GetUserFrozen()
            if (res.data.ServiceUserId>0){
              this.setData({
                bo_end:true
              })
              setTimeout(() => {
                wx.reLaunch({
                  url: '../Home/OnlineService/OnlineService'
                });
              }, 500);
            }
          }).catch(err => {
            console.log('err', err)
          })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.bindGetUserInfo()
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})