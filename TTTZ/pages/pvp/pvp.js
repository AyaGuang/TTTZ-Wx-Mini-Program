// index.js
// 获取应用实例
const app = getApp()//获取全局数据

Page({
  /**
   * 页面的初始数据
   */

  data: {
    players:[],//存储玩家信息
    dices:[],//存储骰子信息
    lockdices:[],//存储锁定的骰子
    player_num:2,//玩家人数
    current_player:0,//当前玩家
    turns:1,//游戏轮数
    total_rounds:3,//游戏局数
    current_round:1,//游戏当前局数
    point_type:'无牌型',//当前牌型
    point_sum:0,//总积分=点数和+牌型奖励分
    total_mul:1,//总倍数
    is_mul:false,//是否加倍
    can_mul:true,//能否加倍
    isGameOver:false,//游戏是否结束
    animationRunning:false,//是否播放动画
    winner:{id:"",unique:"",money:0,score:0,type:'',canthrow:true},//存储胜者信息
    animationData: {},//存储动画
    rabbitanimtion:{},//捏兔子动画
    enermyanimtion:{},//对手动画
    muls_array:['+1','+2','+3'],//存储界面显示的加倍字符串
    //托管机器人变量
    canAIthrow:false,//机器人能否投掷
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initGame();
    console.log(this.data.player_num,app.globalData.local_player_money,this.data.total_rounds);
  },

  //定义骰子类，用于保存总积分和牌型
  diceClass:class{
    constructor(sum,type){
      this.sum=sum;
      this.type=type;
    }
  },

  initGame:function(){//初始化游戏，设置玩家人数
    var players=[];
    var dices=[];
    var lockdices=[];
    var is_tuoguan_array=[];
    this.setData({//将全局数据保存的玩家人数和游戏局数先赋值给data
      player_num:app.globalData.local_player_num,
      total_rounds:app.globalData.local_game_rounds
    });
    for(var i=0;i<this.data.player_num;i++){
      let player_id='玩家'+(i+1).toString();
      players.push({id:player_id,unique:"",money:app.globalData.local_player_money,score:0,type:'',canthrow:true,is_AI:false});
      dices.push({paths:["/static/images/pvp_game/dice0.png","/static/images/pvp_game/dice0.png","/static/images/pvp_game/dice0.png","/static/images/pvp_game/dice0.png","/static/images/pvp_game/dice0.png"],
      timers:[null,null,null,null,null],
      locks:[false,false,false,false,false],
      points:[0,0,0,0,0]},)
      lockdices.push([]);
    }
    this.setData({
      players:players,
      dices:dices,
      lockdices:lockdices,
      is_tuoguan_array:is_tuoguan_array
    });
    this.playRabbit();
  },

  //改变每个骰子的点数
  change_dice_i: function(i){
    var dices=this.data.dices;
    var dice=dices[this.data.current_player];
    var locks=dice.locks;
    //获取骰子锁信息，如果没被锁住才能投掷
    if(!locks[i]){
      var dice_num = [1, 2, 3, 4, 5, 6];
      var paths=dice.paths;
      var timers=dice.timers;
      var timer=timers[i];
      var points=dice.points;
      //生成一个计时器，每隔50ms切换一次骰子点数，持续1s
      timer = setInterval(() => {
        if (dice_num.length <= 0) {
          dice_num = [1, 2, 3, 4, 5, 6];
        } 
        else {
          var randnum = Math.floor(Math.random() * dice_num.length);
          paths[i]="/static/images/pvp_game/dice" + dice_num[randnum].toString() + ".png"//-----需改为项目中地址------
          points[i]=dice_num[randnum];
          dice.paths=paths;
          dice.points=points;
          dices[this.data.current_player]=dice;
          this.setData({
            dices:dices
          });
          dice_num.splice(randnum, 1);
        }
      }, 50);
      dice.timers=timers;
      dices[this.data.current_player]=dice;
      this.setData({
        dices:dices
      });
      //1s后清除计时器
      setTimeout(()=>{
        clearInterval(timer);
        this.setData({
          animationRunning:false
        });
      },1000)
    }
  },

  change_dices: function() {
    for(var i=0;i<5;i++){
      //每个骰子都投一次
      this.change_dice_i(i);
    }
    //以下为测试代码，可以删掉
    setTimeout(()=>{
      var diceclass=this.getPointType(this.data.dices[this.data.current_player].points);
      var players=this.data.players;
      players[this.data.current_player].score=diceclass.sum;
      players[this.data.current_player].type=diceclass.type;
      this.setData({
        players:players,
        point_type:diceclass.type,
        point_sum:diceclass.sum
      });
    },1000)
  },

  //开始投掷的函数
  startShake: function() {
    if(!this.data.animationRunning){//如果当前还没播放动画，则可以投掷骰子，防止动画未播完又按开始按钮
      this.setData({
        animationRunning:true
      });
      this.change_dices();
    }
  },

  //切换骰子的状态，被锁或没被锁，用于绑定在每个骰子图片上，点击一次就可以切换一次状态
  changeState:function(event){
    if(!this.data.players[this.data.current_player].canthrow&&!this.data.players[this.data.current_player].is_AI){
      const i = event.currentTarget.dataset.params;//获取这是第几个骰子的数据
      var dices=this.data.dices;
      var lockdices=this.data.lockdices;
      var dice=dices[this.data.current_player];
      var locks=dice.locks;
      if(!locks[i]){
        locks[i]=true;//切换到与当前相反的状态
        dice.locks=locks;
        dices[this.data.current_player]=dice;
        lockdices[this.data.current_player].push(dice.points[i]);//将被锁定骰子加入锁定区中
      }
      this.setData({
        dices:dices,
        lockdices:lockdices
      });
    }
  },

  //控制骰子的下落动画
  playAnimation:function() {
    const animation = wx.createAnimation({
      duration: 1000, // 动画时长
      timingFunction: 'linear', // 动画速度曲线
    });
    // 定义动画
    animation.translate(0, '-180%').rotateZ(70).step({ duration: 500 });
    animation.translate(0, '0%').rotateZ(0).step({ duration: 100 });
    animation.translate(0, '-45%').rotateZ(-30).step({ duration: 150 });
    animation.translate(0, '0%').rotateY(0).step({ duration: 50 });
    animation.translate(0, '-20%').rotateZ(20).step({ duration: 100 });
    animation.translate(0, '0%').rotateZ(0).step({ duration: 100 });
    // 更新动画数据
    this.setData({
      animationData: animation.export(),
    });
    // 清除动画
    setTimeout(() => {
      this.setData({
        animationData: {},
      });
    }, 1000);
  },

  changePlayer:function() {
    const animation = wx.createAnimation({
      duration: 800, // 动画时长
      timingFunction: 'linear', // 动画速度曲线
    });   
    // 定义动画
    animation.translate('-250%',0).step({ duration: 300 });
    animation.translate('250%',0).step({ duration: 1 });
    animation.translate(0,0).step({ duration: 250 });
    animation.translate('-40%',0).step({ duration: 100 });
    animation.translate('30%',0).step({ duration: 100 });
    animation.translate(0,0).step({ duration: 50 });
    // 更新动画数据
    this.setData({
      rabbitanimtion: animation.export(),
    });
    // 清除动画
    setTimeout(() => {
      this.setData({
        rabbitanimtion: {},
      });
    }, 1000);
  },

  playRabbit:function() {
    const animation = wx.createAnimation({
      duration: 500, // 动画时长
      timingFunction: 'linear', // 动画速度曲线
    });
    // 定义动画
    animation.scale(1.2,0.6).step({ duration: 200 });
    animation.scale(0.8,1.2).step({ duration: 50 });
    animation.scale(1.2,0.8).step({ duration: 50 });
    animation.scale(1.1,0.9).step({ duration: 50 });
    animation.scale(0.9,1.1).step({ duration: 50 });
    animation.scale(1,1).step({ duration: 50 });
    // 更新动画数据
    this.setData({
      rabbitanimtion: animation.export(),
    });
    // 清除动画
    setTimeout(() => {
      this.setData({
        rabbitanimtion: {},
      });
    }, 1000);
  },

  enermyAnimationPlay  :function() {
    const animation = wx.createAnimation({
      duration: 120, // 动画时长
      timingFunction: 'linear', // 动画速度曲线
    });
    // 定义动画
    animation.translate(50,0).step(20);
    animation.translate(-20,0).step(15);
    animation.translate(10,0).step(10);
    animation.translate(0,0).step(5);
    // 更新动画数据
    this.setData({
      enermyanimtion: animation.export(),
    });
    // 清除动画
    setTimeout(() => {
      this.setData({
        enermyanimtion: {},
      });
    }, 1000);
  },

  isAllLock:function(locks){
    for(var i=0;i<5;i++){
      if(locks[i]==false) return false;
    }
    return true;
  },

  //启动骰子落下动画和点数切换动画，需要绑定在开始按钮上
  clickButton:function(){
    if(this.data.players[this.data.current_player].canthrow
      &&!this.isAllLock(this.data.dices[this.data.current_player].locks)
      &&!this.data.isGameOver
      &&!this.data.players[this.data.current_player].is_AI){//只有骰子能被投掷过才能开始投掷
      this.startShake();
      this.playAnimation();
      var players=this.data.players;
      players[this.data.current_player].canthrow=false;//每次只能投一次骰子，所以投完后要设canthrow为0
      this.setData({
        players:players
      });
    }
  },

  //确认骰子，跳过当前回合，同时需要把骰子数据恢复让下一个玩家投
  //当最后一名玩家按下确定按钮后轮数可能满以及局数也可能满，所以游戏进入新一轮，新一局以及判断游戏结束也在这判断
  commit: function() {
    if((!this.data.players[this.data.current_player].canthrow
      ||this.isAllLock(this.data.dices[this.data.current_player].locks))
      &&!this.data.isGameOver
      &&!this.data.players[this.data.current_player].is_AI){
      var point_type = '';
      var point_sum = 0;
      var turns = this.data.turns;
      var currrent_round=this.data.current_round;
      var current_player = this.data.current_player + 1;
      var players = this.data.players; // 创建 players 的副本进行操作
      var dices=this.data.dices;//创建dices副本
      var lockdices=this.data.lockdices;
      var total_mul=this.data.total_mul;
      if (current_player == this.data.player_num) {//如果下标超过人数，说明可以进行下一轮
        current_player = current_player % this.data.player_num;
        turns++;
        for (let j = 0; j < this.data.player_num; j++) {//把是否可以投掷状态恢复
          players[j].canthrow = true;
        }
      }
      if(turns>3){//按完后如果轮数大于3，则说明当局结束，进入下一轮
        turns=1;
        currrent_round++;
        this.checkout();
        for(let j=0;j<this.data.player_num;j++){//进入新一轮，重置玩家和骰子信息
          dices[j]={paths:["/static/images/pvp_game/dice0.png","/static/images/pvp_game/dice0.png","/static/images/pvp_game/dice0.png","/static/images/pvp_game/dice0.png","/static/images/pvp_game/dice0.png"],
          timers:[null,null,null,null,null],locks:[false,false,false,false,false],points:[0,0,0,0,0]};
          players[j].type='';players[j].score=0;total_mul=1;
          lockdices[j]=[];
        }
      }
      if(currrent_round>this.data.total_rounds){//如果当前局数超过总局数，游戏结束
        currrent_round=this.data.total_rounds;
        this.setData({
          isGameOver:true
        });
      }
      //更新当前玩家信息
      this.setData({
        players: players,
        dices:dices,
        lockdices:lockdices,
        point_type: '',point_sum: 0,
        turns: turns,
        total_mul:total_mul,can_mul:true,
        current_round:currrent_round,current_player: current_player
      });
      this.changePlayer();
      if(this.data.players[this.data.current_player].is_AI){
        setTimeout(()=>{
        this.setData({
          canAIthrow:true
        });
        this.AIController();},1000)//1s后开始转为人机控制
      }
    }
  },

  addMul:function(){
    if(this.data.can_mul&&!this.data.isGameOver&&!this.data.players[this.data.current_player].is_AI){
      this.setData({
        is_mul:!this.data.is_mul
      });
    }
  },

  addMul_i:function(event){
    var index=event.currentTarget.dataset.params;
    this.setData({
      is_mul:!this.data.is_mul,
      total_mul: this.data.total_mul + (parseInt(index) + 1),
      can_mul:false
    });
  },

  set_AI:function(){
    var players=this.data.players;
    //将托管状态设置为相反状态
    players[this.data.current_player].is_AI=!players[this.data.current_player].is_AI;
    //修改玩家名字（加上托管两个字）
    if(players[this.data.current_player].is_AI){
      players[this.data.current_player].id='玩家'+(this.data.current_player+1).toString()+'(托管)';
    }
    else{
      players[this.data.current_player].id='玩家'+(this.data.current_player+1).toString();
    }
    this.setData({
      players:players,
    }); 
    if(this.data.players[this.data.current_player].is_AI){
      setTimeout(()=>{
      this.setData({
        canAIthrow:true
      });
      this.AIController();},1000)//1s后开始转为人机控制
    }
  },

  //计算所有骰子点数和
  points_sum:function(points) {
    var sum=0;
    for(var i=0;i<5;i++){
      sum+=points[i];
    }
    return sum;
  },

  //获得出现次数最少的骰子并且出现次数不为0
  getMinCount:function(point_count) {
    var min=6;
    for(var i=1;i<=6;i++){
      if(point_count[i]<min&&point_count[i]>0)
        min=point_count[i];
    }
    return min;
  },

  //获取骰子的总积分和牌型
  getPointType:function(points){
    var point_count=[0,0,0,0,0,0,0];
    var diceClass=new this.diceClass(0,'无牌型');
    var points_sum=this.points_sum(points);
    //计算每种点数出现次数
    for(let i=0;i<5;i++){
      point_count[points[i]]++;
    }
    //获取最大的出现次数是多少和最小的出现次数是多少
    var max_count=Math.max(...point_count),min_count=this.getMinCount(point_count);
    if(max_count==2){//如果最大的出现次数是2，说明只有双对和无牌型两种情况
      let count=0;
      //统计出现了几次双对
      for(let i=1;i<=6;i++){
        if(point_count[i]==2) count++;
      }
      if(count==2){
        diceClass.sum=points_sum+10;
        diceClass.type='双对';
      }
      else{
        diceClass.sum=points_sum;
        diceClass.type='无牌型';
      }
    }
    else if(max_count==3){
      if(min_count==1){
        diceClass.sum=points_sum+10;
        diceClass.type='三连';
      }
      else{
        diceClass.sum=points_sum+20;
        diceClass.type='葫芦';
      }
    }
    else if(max_count==4){
      diceClass.sum=points_sum+40;
      diceClass.type='四连';
    }
    else if(max_count==5){
      diceClass.sum=points_sum+100;
      diceClass.type='五连';
    }
    ///如果以上情况都不是，说明每种骰子都只出现一次，则可能是顺子或无牌型
    if(max_count==1||(max_count==2&&diceClass.type=='无牌型')){//需要考虑等于2的情况是因为可能有1，1，2，3，4的情况，属于小顺子，
      //但是会被之前max_count等于2的情况下判断为无牌型，所以这里还要再判断一次
      let count=0,max_count2=0;
      //统计连续的点数序列有多长
      for(let i=1;i<=6;i++){
        if(point_count[i]>0){
          count++;
        }
        else{
          count=0;
        }
        if(count>max_count2) max_count2=count;
      }
      if(max_count2==4){
        diceClass.sum=points_sum+30;
        diceClass.type='小顺子';
      }
      else if(max_count2==5){
        diceClass.sum=points_sum+60;
        diceClass.type='大顺子';
      }
      else{
        diceClass.sum=points_sum;
        diceClass.type='无牌型';
      }
    }
    return diceClass;
  },

  //当前局结束后对此局进行结算
  checkout:function(){
    var max_score=0,max_player_index=0,max_money=0,max_money_index=0;
    var players=this.data.players;
    //找出得分最高的玩家
    for(let i=0;i<this.data.player_num;i++){
      if(this.data.players[i].score>max_score){
        max_score=this.data.players[i].score;
        max_player_index=i;
      }
    }
    //将剩余玩家的筹码给胜者
    for(let i=0;i<this.data.player_num;i++){
      if(i!=max_player_index){
        //直接用加法会莫明奇妙变成字符串相加，出现100+1=1001这种奇怪bug,但减法又没事；暂时找不出问题所在，先改成减去负数就没问题了
        players[max_player_index].money-=-this.data.total_mul*(max_score-players[i].score);
        players[i].money-=this.data.total_mul*(max_score-players[i].score);
        if(players[i].money<=0){//扣完筹码后若有玩家筹码小于0，则游戏直接结束
          this.setData({
            isGameOver:true
          });
        }
      }
    }
    //找出筹码最高的玩家
    for(let i=0;i<this.data.player_num;i++){
      if(this.data.players[i].money>max_money){
        max_money=this.data.players[i].money;
        max_money_index=i;
      }
    }
    //确定当前胜者
    this.setData({
      winner:players[max_money_index]
    });
  },

  AIcommit:function(){
    var point_type = '';
    var point_sum = 0;
    var turns = this.data.turns;
    var currrent_round=this.data.current_round;
    var current_player = this.data.current_player + 1;
    var players = this.data.players; // 创建 players 的副本进行操作
    var dices=this.data.dices;//创建dices副本
    var lockdices=this.data.lockdices;
    var total_mul=this.data.total_mul;
    if (current_player == this.data.player_num) {//如果下标超过人数，说明可以进行下一轮
      current_player = current_player % this.data.player_num;
      turns++;
      for (let j = 0; j < this.data.player_num; j++) {//把是否可以投掷状态恢复
        players[j].canthrow = true;
      }
    }
    if(turns>3){//按完后如果轮数大于3，则说明当局结束，进入下一轮
      turns=1;
      currrent_round++;
      this.checkout();
      for(let j=0;j<this.data.player_num;j++){//进入新一轮，重置玩家和骰子信息
        dices[j]={paths:["/static/images/pvp_game/dice0.png","/static/images/pvp_game/dice0.png","/static/images/pvp_game/dice0.png","/static/images/pvp_game/dice0.png","/static/images/pvp_game/dice0.png"],
        timers:[null,null,null,null,null],locks:[false,false,false,false,false],points:[0,0,0,0,0]};
        players[j].type='';players[j].score=0;total_mul=1;
        lockdices[j]=[];
      }
    }
    if(currrent_round>this.data.total_rounds){//如果当前局数超过总局数，游戏结束
      currrent_round=this.data.total_rounds;
      this.setData({
        isGameOver:true
      });
    }
    //更新当前玩家信息
    this.setData({
      players: players,
      dices:dices,
      lockdices:lockdices,
      point_type: '',point_sum: 0,
      turns: turns,
      total_mul:total_mul,can_mul:true,
      current_round:currrent_round,current_player: current_player
    });
    if(!this.data.isGameOver) this.changePlayer();
    if(this.data.players[this.data.current_player].is_AI){
      setTimeout(()=>{
      this.setData({
        canAIthrow:true
      });
      this.AIController();},1000)//1s后开始转为人机控制
    }
  },

  //计算最优锁定方法
  calculateBestLocks:function(points,locks) {
    let locksPossible=[];//存储所有可能的骰子锁定数组
    let max_score=0;//存储最大的分数期望
    let best_locks=[];//存储最优锁定方法
    let res=[];
    //定义一个深度优先搜索，查找每种锁定数组，然后存储到locksPossible中
    const lockDFS=(cur_points,cur_locks,cur_index)=>{
      let locks_copy=[...cur_locks];//复制副本，用于递归，防止原数组被篡改
      if(cur_index==cur_points.length){
        locksPossible.push(locks_copy);//如果遍历的下表超过数组长度，说明此次递归到尽头，则保存当前的锁定数组
        return;
      }
      if(!locks_copy[cur_index]){//如果当前骰子没被锁定，则骰子被锁定和没被锁定的情况都要遍历一次
        locks_copy[cur_index]=false;
        lockDFS(cur_points,locks_copy,cur_index+1);
        locks_copy[cur_index]=true;
        lockDFS(cur_points,locks_copy,cur_index+1);
      }
      else{//被锁定则没有别的选择，直接看下一个骰子
        lockDFS(cur_points,locks_copy,cur_index+1);
      }
    }
    lockDFS(points,locks,0);//执行递归函数，获得所有可能的锁定数组
    //遍历所有可能的锁定数组，计算每种锁定情况对应的分数期望
    for(let i=0;i<locksPossible.length;i++){
      let total_score=0;//存储当前锁定方法下每种投掷结果获得分数的综合
      let count=0;//存储当前锁定方法下共有每种投掷结果
      //上面二者相除及为获得分数的平均值或期望
      //遍历接下来投掷可能出现的所有点数结果
      const pointsDFS=(cur_points,cur_locks,cur_index)=>{//定义深度优先搜索函数
        let points_copy=[...cur_points];
        if(cur_index==points_copy.length){//当前递归下标等于数组长度，当此递归结束
          total_score+=this.getPointType(points_copy).sum;//直接调用之前定义的计算骰子分数的函数
          count++;
          return;
        }
        if(!cur_locks[cur_index]){//如果骰子没被锁定，则下次投掷可能出现1-6的点数，每种都要递归一次
          for(let j=1;j<=6;j++){
            points_copy[cur_index]=j;
            pointsDFS(points_copy,cur_locks,cur_index+1);
          }
        }
        else{
          pointsDFS(points_copy,cur_locks,cur_index+1);
        }
      }
      pointsDFS(points,locksPossible[i],0);//根据当前锁定数组计算期望
      if(count>0&&total_score/count>max_score){
        max_score=total_score/count;
        best_locks=locksPossible[i];
      }
    }
    res.push(best_locks);
    res.push(max_score);
    return res;
  },

  //人机自动加倍
  AIAddMul:function(){
    var dices=this.data.dices;
    var AI_points=dices[this.data.current_player].points;
    var AI_locks=dices[this.data.current_player].locks;
    var AI_score=this.calculateBestLocks(AI_points,AI_locks)[1];
    if(30<=AI_score&&AI_score<40){
      this.setData({
        total_mul:this.data.total_mul+1
      });
    }
    else if(40<=AI_score&&AI_score<50){
      this.setData({
        total_mul:this.data.total_mul+2
      });
    }
    else if(50<=AI_score){
      this.setData({
        total_mul:this.data.total_mul+3
      });
    }
  },

  AIController:function(){
    if(this.data.canAIthrow&&!this.isAllLock(this.data.dices[this.data.current_player].locks)
      &&!this.data.isGameOver){
      if(this.data.players[this.data.current_player].canthrow){
        this.startShake();//直接模拟人执行投骰子函数
        this.playAnimation();
      }
      var dices,points,locks,lockdices=this.data.lockdices,lockdice=[];
      setTimeout(()=>{//因为开始投掷到得出点数需要1s的动画，所以过1s后获取骰子信息才有效
        dices=this.data.dices;
        points=dices[this.data.current_player].points;
        locks=dices[this.data.current_player].locks;
        locks=this.calculateBestLocks(points,locks)[0];
        dices[this.data.current_player].locks=locks;
        for(let i=0;i<5;i++){//将被锁的骰子放入锁定区中
          if(locks[i]){
            lockdice.push(points[i]);
          }
        }
        lockdices[this.data.current_player]=lockdice;
      },1000);
      setTimeout(()=>{
        this.setData({
          dices:dices,
          lockdices:lockdices,
          canAIthrow:false
        });
        if(this.data.can_mul){
          this.AIAddMul()
        }
      },1000);
    }
    setTimeout(()=>{
      if(!this.data.isGameOver) this.AIcommit();
    },2500)
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

  }
  
})