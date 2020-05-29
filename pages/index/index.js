//index.js
//获取应用实例
const app = getApp()
const util = require('../../utils/util.js')
import mqtt from '../../utils/mqtt.min.js';
//连接的服务器域名，注意格式！！！
const host = 'wxs://a0je61a.mqtt.iot.gz.baidubce.com/mqtt';

let colorPickerCtx = {};
let sliderCtx = {};
let _this = null
Page({
  data: {
    pickColor: null,
    raduis: 550, //这里最大为750rpx铺满屏幕
    valueWidthOrHerght: 0 ,
    client: null,
    //记录重连的次数
    reconnectCounts: 0,
    //MQTT连接的配置
    options: {
      protocolVersion: 4, //MQTT连接协议版本
      clientId: 'miniTest',
      clean: false,
      password: 'iQF4tTnLxKnXwEF6',
      username: 'a0je61a/wechat',
      reconnectPeriod: 1000, //1000毫秒，两次重新连接之间的间隔
      connectTimeout: 30 * 1000, //1000毫秒，两次重新连接之间的间隔
      resubscribe: true //如果连接断开并重新连接，则会再次自动订阅已订阅的主题（默认true）
    }
  },

  onLoad: function() {
    _this = this
    colorPickerCtx = wx.createCanvasContext('colorPicker');
    colorPickerCtx.fillStyle = 'rgb(255, 255, 255)';
    sliderCtx = wx.createCanvasContext('colorPickerSlider');
    this.MqttConnect()
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

  onClickRedColor: function() {
    let h = util.rgb2hsl(255, 0, 0);
    util.drawSlider(sliderCtx, _this.data.valueWidthOrHerght, _this.data.valueWidthOrHerght, h[0]);
    this.setData({
      pickColor: JSON.stringify({
        red: 255,
        green: 0,
        blue: 0
      })
    })
    this.MqttPubMsg({
      change : "pwm" ,
      value:[
         255,0,0
      ]
    })
  },

  onClickGreenColor: function() {
    let h = util.rgb2hsl(0, 255, 0);
    util.drawSlider(sliderCtx, _this.data.valueWidthOrHerght, _this.data.valueWidthOrHerght, h[0]);
    this.setData({
      pickColor: JSON.stringify({
        red: 0,
        green: 255,
        blue: 0
      })
    })
    this.MqttPubMsg({
      change : "pwm" ,
      value:[
         0,255,0
      ]
    })
  },

  onClickBlueColor: function() {
    let h = util.rgb2hsl(0, 0, 255);
    util.drawSlider(sliderCtx, _this.data.valueWidthOrHerght, _this.data.valueWidthOrHerght, h[0]);
    this.setData({
      pickColor: JSON.stringify({
        red: 0,
        green: 0,
        blue: 255
      })
    })
    this.MqttPubMsg({
      change : "pwm" ,
      value:[
         0,0,255
      ]
    })
  },
  onClickOn:function(){
    this.MqttPubMsg({
      change : "power" ,
      value:"true"
    })
  },
  onClickOff:function(){
    this.MqttPubMsg({
      change : "power" ,
      value: "false"
    })
  } ,
  onClickQuery:function(){
    this.MqttPubMsg({
      change : "query" ,
      value: "false"
    })
  } ,
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
          that.MqttPubMsg({
            change : "pwm" ,
            value:[
              res.data[0],res.data[1],res.data[2]
            ]
          })

          // 判断是否在圈内
          if (h[1] !== 1.0) {
            return;
          }
          util.drawSlider(sliderCtx, _this.data.valueWidthOrHerght, _this.data.valueWidthOrHerght, h[0]);
          // 设置设备
          if (e.type !== 'touchEnd') {
            // 触摸结束才设置设备属性
            return;
          }
        }
      });
    }
  } ,
  MqttConnect: function() {

    var that = this;
    //开始连接
    this.data.client = mqtt.connect(host, this.data.options);
    this.data.client.on('connect', function(connack) {
      that.MqttSubOne();
      wx.showToast({
        title: '连接成功'
      })
    })


    //服务器下发消息的回调
    that.data.client.on("message", function(topic, payload) {
     // console.log(" 收到 topic:" + topic + " , payload :" + payload)
      let data = JSON.parse(payload)
      that.setData({
        pickColor: JSON.stringify({
          red: data.Red,
          green:data.Green,
          blue: data.Blue,
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
  MqttSubOne: function() {
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
  MqttPubMsg: function(payload) {
    if (this.data.client && this.data.client.connected) {
      this.data.client.publish('/light/deviceIn', JSON.stringify(payload));
      wx.showToast({
        title: '发布成功'
      })
    } else {
      wx.showToast({
        title: '请先连接服务器',
        icon: 'none',
        duration: 2000
      })
    }
  },
  
})