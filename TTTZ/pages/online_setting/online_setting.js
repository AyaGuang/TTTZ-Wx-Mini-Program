// pages/pvp_setting/pvp_setting.js

var app=getApp();
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'


Page({

  /**
   * 页面的初始数据
   */
  data: {
      avatarUrl: defaultAvatarUrl,
      nickName: "",
      players:2,
      money:1000,
      rounds:3,
  },
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail 
    this.setData({
      avatarUrl,
    })
  },
  creatRoom:function(){
    app.globalData.userInfo = {name:this.data.nickName,avatarUrl:this.data.avatarUrl}
    app.globalData.local_player_num=this.data.players;
    app.globalData.local_player_money=this.data.money;
    app.globalData.local_game_rounds=this.data.rounds;
    // console.log(app.globalData.userInfo);
    wx.redirectTo({
      url: '/pages/online/online?id=1',
    })  
  },
  enterRoom:function(){
    app.globalData.userInfo = {name:this.data.nickName,avatarUrl:this.data.avatarUrl}
    app.globalData.local_player_num=this.data.players;
    app.globalData.local_player_money=this.data.money;
    app.globalData.local_game_rounds=this.data.rounds;
    wx.redirectTo({
      url: '/pages/online/online?id=0',
    })  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

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