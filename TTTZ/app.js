import GoEasy from './static/lib/package/goeasy.esm.min';

// app.js
App({
  onLaunch() {
    wx.goEasy = GoEasy.getInstance({
        host:'hangzhou.goeasy.io', 
        appkey: 'BC-a9b2148084374a5ca2a9500563a67304',//替换为您的应用appkey
        modules: ['pubsub']
      });
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
  },
  //定义全局数据，传递游戏人数，筹码等参数
  globalData: {
    userInfo: {name:"test",avatarUrl:'/static/images/pvp_game/peo_icon.png'},
    local_player_num:2,
    local_player_money:1000,
    local_game_rounds:3,
    AI_difficuty:1
  },
})

