// pages/pvp_setting/pvp_setting.js

var app=getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
      players:2,
      money:1000,
      rounds:1
  },


  onClick:function(){
      app.globalData.local_player_num = this.data.players
      app.globalData.local_player_money = this.data.money
      app.globalData.local_game_rounds = this.data.rounds
      wx.redirectTo({
        url: '/pages/pvp/pvp',
      })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.globalData.local_player_num=this.data.players;
    app.globalData.local_player_money=this.data.money;
    app.globalData.local_game_rounds=this.data.rounds;
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