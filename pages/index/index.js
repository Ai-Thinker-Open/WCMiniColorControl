//index.js
//获取应用实例
const app = getApp()
const util = require('../../utils/util.js')
//引进我们的 mqtt 库
const mqtt = require('../../utils/mqtt.min.js')
//连接mqtt 的域名，我提供的这个库的域名入参参数是 以 wxs 开头 还支持阿里小程序，后缀的 /mqtt 表示是一种服务
// 域名 a0je61a.mqtt.iot.gz.baidubce.com
const host = 'wxs://a0je61a.mqtt.iot.gz.baidubce.com/mqtt'

let colorPickerCtx = {};
let sliderCtx = {};
let _this = null
Page({
  data: {
    pickColor: null,
    raduis: 550, //这里最大为750rpx铺满屏幕
    valueWidthOrHerght: 0,
    client: null,
    //记录重连的次数
    reconnectCounts: 0,
    //MQTT连接的配置
    options: {
      protocolVersion: 4, //MQTT连接协议版本
      clientId: 'miniTest',
      clean: false,
      password: 'OHiLItaGMsEx0cwh',
      username: 'a0je61a/wechat',
      reconnectPeriod: 1000, //1000毫秒，两次重新连接之间的间隔
      connectTimeout: 30 * 1000, //1000毫秒，两次重新连接之间的间隔
      resubscribe: true //如果连接断开并重新连接，则会再次自动订阅已订阅的主题（默认true）
    }
  },
  mqttConnect: function() {

    var that = this;
    //开始连接
    this.data.client = mqtt.connect(host, this.data.options);
    this.data.client.on('connect', function(connack) {
      wx.showToast({
        title: '连接成功'
      })

      that.onClickSync()
    })


    //设备端上报消息的回调
    that.data.client.on("message", function(topic, payload) {
      let data = JSON.parse(payload)
  
      let h = util.rgb2hsl(data.Red, data.Green, data.Blue);
      util.drawSlider(sliderCtx, _this.data.valueWidthOrHerght, that.data.valueWidthOrHerght, h[0]);
      that.setData({
        pickColor: JSON.stringify({
          red:  data.Red,
          green:  data.Green,
          blue: data.Blue
        })
      })
    })


    //服务器连接异常的回调
    that.data.client.on("error", function(error) {
      console.log(" 服务器 error 的回调" + error)

    })

    //服务器重连连接异常的回调
    that.data.client.on("reconnect", function() {
      console.log(" 服务器 reconnect的回调")

    })


    //服务器连接异常的回调
    that.data.client.on("offline", function(errr) {
      console.log(" 服务器offline的回调")

    })


  },
  mqttSubTopic: function() {
    if (this.data.client && this.data.client.connected) {
      //仅订阅单个主题
      this.data.client.subscribe('/light/deviceOut', function(err, granted) {
        if (!err) {
          wx.showToast({
            title: '订阅主题成功'
          })
        } else {
          wx.showToast({
            title: '订阅主题失败',
            icon: 'fail',
            duration: 2000
          })
        }
      })
    } else {
      wx.showToast({
        title: '请先连接服务器',
        icon: 'none',
        duration: 2000
      })
    }
  },
  onLoad: function() {
    _this = this
    this.mqttConnect()
    colorPickerCtx = wx.createCanvasContext('colorPicker');
    colorPickerCtx.fillStyle = 'rgb(255, 255, 255)';
    sliderCtx = wx.createCanvasContext('colorPickerSlider');

    let isInit = true;
    wx.createSelectorQuery().select('#colorPicker').boundingClientRect(function(rect) {
      _this.setData({
        valueWidthOrHerght: rect.width,
      })
      if(isInit){
        colorPickerCtx.fillRect(0, 0, rect.width, rect.height);
        util.drawRing(colorPickerCtx, rect.width, rect.height);
        // 设置默认位置
        util.drawSlider(sliderCtx, rect.width, rect.height, 1.0);
        isInit = false;
      }
      
      _this.setData({
        pickColor: JSON.stringify({
          red: 255,
          green: 0,
          blue: 0
        })
      })
    }).exec();
  },
  mqttPubMsg: function(payload) {
    if (this.data.client && this.data.client.connected) {
      this.data.client.publish('/light/deviceIn', payload);
    } else {
      wx.showToast({
        title: '请先连接服务器',
        icon: 'none',
        duration: 2000
      })
    }
  },

  onClickRedColor: function() {

    let obj = {
      "change": "pwm",
      "value": [255, 0, 0]
    }
    this.mqttPubMsg(JSON.stringify(obj))
    let h = util.rgb2hsl(255, 0, 0);
    util.drawSlider(sliderCtx, _this.data.valueWidthOrHerght, _this.data.valueWidthOrHerght, h[0]);
    this.setData({
      pickColor: JSON.stringify({
        red: 255,
        green: 0,
        blue: 0
      })
    })
  },

  onClickGreenColor: function() {
    let obj = {
      "change": "pwm",
      "value": [0, 255, 0]
    }
    this.mqttPubMsg(JSON.stringify(obj))

    let h = util.rgb2hsl(0, 255, 0);
    util.drawSlider(sliderCtx, _this.data.valueWidthOrHerght, _this.data.valueWidthOrHerght, h[0]);
    this.setData({
      pickColor: JSON.stringify({
        red: 0,
        green: 255,
        blue: 0
      })
    })
  },

  onClickBlueColor: function() {
    let obj = {
      "change": "pwm",
      "value": [0, 0, 255]
    }
    this.mqttPubMsg(JSON.stringify(obj))

    let h = util.rgb2hsl(0, 0, 255);
    util.drawSlider(sliderCtx, _this.data.valueWidthOrHerght, _this.data.valueWidthOrHerght, h[0]);
    this.setData({
      pickColor: JSON.stringify({
        red: 0,
        green: 0,
        blue: 255
      })
    })
  },
  onClickOpen:function(){
    let obj  = {
      "change": "power",
      "value": "true"
    }
    this.mqttPubMsg(JSON.stringify(obj))
  },
  onClickOff:function(){
    let obj = {
      "change": "power",
      "value": "false"
    }
    this.mqttPubMsg(JSON.stringify(obj))
  },
  onClickSync:function(){
     let obj = {
      "change": "query",
      "value": "false"
    }
    this.mqttPubMsg(JSON.stringify(obj))
  },
  onSlide: function(e) {
    let that = this;
    if (e.touches && ( e.type === 'touchend')) {
      console.log("ok");
      let x = e.changedTouches[0].x;
      let y = e.changedTouches[0].y;
      if (e.type !== 'touchend') {
        x = e.touches[0].x;
        y = e.touches[0].y;
      }
      //复制画布上指定矩形的像素数据
      wx.canvasGetImageData({
        canvasId: "colorPicker",
        x: x,
        y: y,
        width: 1,
        height: 1,
        success(res) {

         
          // 转换成hsl格式，获取旋转角度
          let h = util.rgb2hsl(res.data[0], res.data[1], res.data[2]);
          that.setData({
            pickColor: JSON.stringify({
              red: res.data[0],
              green: res.data[1],
              blue: res.data[2]
            })
          })
          // 判断是否在圈内
          if (h[1] !== 1.0) {
            return;
          }
          let obj = {
            "change": "pwm",
            "value": [res.data[0], res.data[1], res.data[2]]
          }
          that.mqttPubMsg(JSON.stringify(obj))


          util.drawSlider(sliderCtx, _this.data.valueWidthOrHerght, _this.data.valueWidthOrHerght, h[0]);
          // 设置设备
          if (e.type !== 'touchEnd') {
            // 触摸结束才设置设备属性
            return;
          }
        }
      });
    }
  }
})
