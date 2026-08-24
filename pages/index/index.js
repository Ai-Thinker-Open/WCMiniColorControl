//index.js
const util = require('../../utils/util.js')
const mqtt = require('../../utils/mqtt.min.js')
const mqttConfig = require('../../config/mqtt.js')

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
    options: {
      protocolVersion: 4,
      clientId: mqttConfig.clientId,
      clean: false,
      password: mqttConfig.password,
      username: mqttConfig.username,
      reconnectPeriod: 1000,
      connectTimeout: 30 * 1000,
      resubscribe: true
    }
  },
  mqttConnect: function() {
    var that = this;
    if (!mqttConfig.host || !mqttConfig.username || !mqttConfig.password) {
      wx.showModal({
        title: 'MQTT 配置缺失',
        content: '请先按 README 配置 config/mqtt.js，再重新编译。',
        showCancel: false
      })
      return
    }

    this.data.client = mqtt.connect(mqttConfig.host, this.data.options);
    this.data.client.on('connect', function(connack) {
      wx.showToast({
        title: '连接成功'
      })
      that.mqttSubTopic()
      that.onClickSync()
    })


    //设备端上报消息的回调
    that.data.client.on("message", function(topic, payload) {
      let data
      try {
        data = JSON.parse(String(payload))
      } catch (error) {
        console.warn('忽略无法解析的 MQTT 消息')
        return
      }
      if (!util.isRgbPayload(data)) {
        console.warn('忽略格式或数值范围不正确的 MQTT 消息')
        return
      }
  
      let h = util.rgb2hsl(data.Red, data.Green, data.Blue);
      util.drawSlider(sliderCtx, that.data.valueWidthOrHerght, that.data.valueWidthOrHerght, h[0]);
      that.setData({
        pickColor: JSON.stringify({
          red:  data.Red,
          green:  data.Green,
          blue: data.Blue
        })
      })
    })


    //服务器连接异常的回调
    that.data.client.on("error", function() {
      console.warn('MQTT 连接发生错误')
    })

    //服务器重连连接异常的回调
    that.data.client.on("reconnect", function() {
      console.info('MQTT 正在重连')

    })


    //服务器连接异常的回调
    that.data.client.on("offline", function(errr) {
      console.info('MQTT 已离线')

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
    colorPickerCtx = wx.createCanvasContext('colorPicker');
    colorPickerCtx.fillStyle = 'rgb(255, 255, 255)';
    sliderCtx = wx.createCanvasContext('colorPickerSlider');

    let isInit = true;
    wx.createSelectorQuery().select('#colorPicker').boundingClientRect(function(rect) {
      if (!rect || !rect.width || !rect.height) {
        wx.showToast({ title: '颜色控件初始化失败', icon: 'none' })
        return
      }
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
      _this.mqttConnect()
    }).exec();
  },
  onUnload: function() {
    if (this.data.client) {
      this.data.client.end(true)
      this.data.client = null
    }
    _this = null
  },
  mqttPubMsg: function(payload) {
    if (this.data.client && this.data.client.connected) {
      this.data.client.publish('/light/deviceIn', payload, function(error) {
        if (error) {
          wx.showToast({ title: '消息发送失败', icon: 'none' })
        }
      });
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
        }
      });
    }
  }
})
