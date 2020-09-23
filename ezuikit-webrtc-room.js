"use strict";

/**
 * ezuikit-webrtc-room
 * version v0.0.1
 */
(function (global, factory) {
  "use strict";

  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = global.document ? factory(global, true) : function (w) {
      if (!w.document) {
        throw new Error("ezuikit-webrtc-room requires a window with a document");
      }
      return factory(w);
    };
  } else {
    factory(global);
  } // Pass this if window is not defined yet

})(typeof window !== "undefined" ? window : void 0, function (window, noGlobal) {
  /** 获取url参数 */
  function getQueryStringWithUrl(name, url) { var r = new RegExp("(\\?|#|&)" + name + "=(.*?)(#|&|$)"); var m = (url || location.href).match(r); return decodeURIComponent(m ? m[2] : ''); }

  // 加载js
  function addJs(filepath, callback) {
    var headerScript = document.getElementsByTagName('head')[0].getElementsByTagName("script");
    var isReady = false;
    for (var i = 0; i < headerScript.length; i++) {
      if (headerScript[i].getAttribute("src") == filepath) {
        isReady = true;
      }
    }
    if (!isReady) {
      var oJs = document.createElement("script");
      oJs.setAttribute("src", filepath);
      oJs.onload = callback;
      document.getElementsByTagName("head")[0].appendChild(oJs);
    }
  }

  function addCss(filepath, callback) {
    var headerLink = document.getElementsByTagName('head')[0].getElementsByTagName("link");
    var isReady = false;
    for (var i = 0; i < headerLink.length; i++) {
      if (headerLink[i].getAttribute("href") == filepath) {
        isReady = true;
      }
    }
    if (!isReady) {
      var oJs = document.createElement('link');
      oJs.rel = 'stylesheet';
      oJs.type = 'text/css';
      oJs.href = filepath;
      oJs.onload = callback;
      document.getElementsByTagName("head")[0].appendChild(oJs);
    }
  }
  function PrefixCode(code,msg) {
    
    if(parseInt(code,10) > 0){
    var PRECODE = 102;
    var retcode = '102' + (code/Math.pow(10,5)).toFixed(5).substr(2);
    } else if (code == -1) {
      retcode = -1;
    }else if (typeof code === 'undefined'){
      retcode = 0;
    }
    return  {
      code : retcode,
      data: msg,
    }
    // function PrefixInteger(num, length) {
    //   return (num/Math.pow(10,length)).toFixed(length).substr(2);
    //  }
  }

  function request(url, method, params, header, success, error) {
    var _url = url;
    var http_request = new XMLHttpRequest();
    http_request.onreadystatechange = function () {
      if (http_request.readyState == 4) {
        if (http_request.status == 200) {
          var _data = JSON.parse(http_request.responseText);
          success(_data);
        }
      }
    };
    http_request.open(method, _url, true); // http_request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    var data = new FormData();
    for (var i in params) {
      data.append(i, params[i]);
    }
    http_request.send(data);
  }
  addCss('https://open.ys7.com/assets/ezuikit_v2.6.4/webrtc/ezuikit-webrtc-room.css', function () { })
  // 检测用户摄像头
  const constraints = {
    audio: true,
    video: true,
  };
  var handleSuccess = function (stream) {
    const audioTracks = stream.getAudioTracks();
    const videoTracks = stream.getVideoTracks();
    if (audioTracks.length > 0) {
      window['localAudioAvailable'] = audioTracks[0].enabled;
    } else {
      console.log("用户开启了麦克风，但未获取到本地音频");
    }
    if (videoTracks.length > 0) {
      window['localVideoAvailable'] = videoTracks[0].enabled;
    } else {
      console.log("用户开启了摄像头，但未获取到本地音频");
    }

  }
  var handleError = function (err) {
    console.log("err", err);
    window['localAudioAvailable'] = false;
    window['localVideoAvailable'] = false;
  }
  navigator.mediaDevices.getUserMedia(constraints).then(handleSuccess).catch(handleError);

  var stsService = "sts://vtmhz.ys7.com:8554/rtc";
  var wsService = "wss://webrtc.ys7.com/rtcgw-ws";
  var apiDomain = "https://open.ys7.com/api/lapp/live/talk/url";

  if (getQueryStringWithUrl("env") === 'test12') {
    var stsService = "sts://10.86.15.202:8554/rtc";
    var wsService = "wss://test12.ys7.com/rtcgw-ws";
    var apiDomain = "https://test12open.ys7.com/api/lapp/live/talk/url";
  }

  addJs('https://open.ys7.com/assets/ezuikit_v2.6.4/npm/js/adapeter.js', function () {
    addJs('https://open.ys7.com/assets/ezuikit_v2.6.4/js/jquery.min.js', function () {
      addJs('https://open.ys7.com/assets/ezuikit_v2.6.4/webrtc/janus.js', function () {
        addJs('https://open.ys7.com/assets/layer/layer.js', function () {
          var EZUIKitWebrtcRoom = function EZUIKitWebrtcRoom(params) {
            var _this = this;
            window['ezuikit-webrtc-' + params.id] = {
              opt: {
                videoWidth: params.videoWidth || 640,
                videoHeight: params.videoHeight || 480,
                showHeader: true,
                showControls: true,
                useMic: true,
                useCam: true,
                roomParams: {
                  room: 0,
                  dev: '',
                  channel: '1',
                  callType: '3',
                  userId: '',
                  othertype: '',
                  clienttype: '105',
                  devstreamtype: '1',
                  streamtype: 2,
                  video: 1,
                },
                stsUrl: stsService,
                janus: null,
                sts: null,
                opaqueId: "sts-" + Janus.randomString(12),
                firstRemoteAttached: false, // 第一次连接是否建立
                durationTimer: null,
                count: 0,
                localUserName: "",
                localAudioAvailable: true,
                localVideoAvailable: true,
                server: wsService,
                apiDomain: apiDomain,
                accessToken: '',
                id: '',
                stream: '',
                isReliesReady: false,
                cln: {
                  // 本地
                  local: {
                    username: '',
                    client_id: '',
                  },
                  // 远程
                  remote: {
                    username: '',
                    client_id: '',
                  },
                  // 第三路
                  third: {
                    username: '',
                    client_id: '',
                  },
                },
                onlyDevice: false,
                previewStyle: {
                  bottom: 60,
                  left: 0,
                },
                headerStyle: {

                },
                state: {
                  countTimer: undefined,
                  // countTime 计时器
                  recodeTime: 0,
                }
              }
            }
            if (params.accessToken) {
              window['ezuikit-webrtc-' + params.id].opt.accessToken = params.accessToken;
            }
            if (params.stream) {
              window['ezuikit-webrtc-' + params.id].opt.stream = params.stream;
            }
            // roomParams
            if (params.deviceSerial) {
              window['ezuikit-webrtc-' + params.id].opt.roomParams.dev = params.deviceSerial;
            }
            if (params.channel) {
              window['ezuikit-webrtc-' + params.id].opt.roomParams.channel = params.channel;
            }
            if (params.userName) {
              window['ezuikit-webrtc-' + params.id].opt.roomParams.userId = params.userName;
              window['ezuikit-webrtc-' + params.id].opt.cln.local.userName = params.userName;
            }
            if (params.room) {
              window['ezuikit-webrtc-' + params.id].opt.roomParams.room = params.room;
            }
            if (params.onlyDevice) {
              window['ezuikit-webrtc-' + params.id].opt.onlyDevice = params.onlyDevice;
            }
            if (params.previewStyle) {
              var defaultStyle = window['ezuikit-webrtc-' + params.id].opt.previewStyle;
              var style = Object.assign(defaultStyle, params.previewStyle);
              var s = [];
              $.each(style, function (i, n) {
                s.push(i + ':' + n);
              });
              s = s.join(';')
              window['ezuikit-webrtc-' + params.id].opt.previewStyle = s;
            }
            if (params.headerStyle) {
              var defaultStyle = window['ezuikit-webrtc-' + params.id].opt.headerStyle;
              var style = Object.assign(defaultStyle, params.headerStyle);
              var s = [];
              $.each(style, function (i, n) {
                s.push(i + ':' + n);
              });
              s = s.join(';')
              window['ezuikit-webrtc-' + params.id].opt.headerStyle = s;
            }
            if (!(typeof params.showHeader == "undefined")) {
              window['ezuikit-webrtc-' + params.id].opt.showHeader = params.showHeader;
            }
            if (!(typeof params.useCam == "undefined")) {
              window['ezuikit-webrtc-' + params.id].opt.useCam = params.useCam;
            }
            if (!(typeof params.useMic == "undefined")) {
              window['ezuikit-webrtc-' + params.id].opt.useMic = params.useMic;
            }
            if (params.type === 'create') {
              window['ezuikit-webrtc-' + params.id].opt.stsUrl += "?room=" + window['ezuikit-webrtc-' + params.id].opt.roomParams.room;
              window['ezuikit-webrtc-' + params.id].opt.stsUrl += "&dev=" + window['ezuikit-webrtc-' + params.id].opt.roomParams.dev;
              window['ezuikit-webrtc-' + params.id].opt.stsUrl += "&channel=" + window['ezuikit-webrtc-' + params.id].opt.roomParams.channel;
              window['ezuikit-webrtc-' + params.id].opt.stsUrl += "&userId=" + window['ezuikit-webrtc-' + params.id].opt.roomParams.userId;
              window['ezuikit-webrtc-' + params.id].opt.stsUrl += "&callType=3&othertype=111&clienttype=105&devstreamtype=1&streamtype=2&video=1";
            } else if (params.type === 'join') {
              window['ezuikit-webrtc-' + params.id].opt.stsUrl += "?room=" + window['ezuikit-webrtc-' + params.id].opt.roomParams.room;
              window['ezuikit-webrtc-' + params.id].opt.stsUrl += "&dev=" + window['ezuikit-webrtc-' + params.id].opt.roomParams.dev;
              window['ezuikit-webrtc-' + params.id].opt.stsUrl += "&channel=" + window['ezuikit-webrtc-' + params.id].opt.roomParams.channel;
              window['ezuikit-webrtc-' + params.id].opt.stsUrl += "&userId=" + window['ezuikit-webrtc-' + params.id].opt.roomParams.userId;
              window['ezuikit-webrtc-' + params.id].opt.stsUrl += "&callType=1&othertype=111&clienttype=105&devstreamtype=1&streamtype=2&video=1";
            }
            // 默认样式
            var customContainer = document.getElementById(params.id);
            customContainer.style = "position: relative;background: #000;text-align: center;display:inline-block;"
            //api 
            function apiSuccess(data) {
              if (data.code == 200) {
                var apiResult = data.data;
                if (apiResult) {
                  // 加载依赖
                  var stream = apiResult.stream;
                  window['ezuikit-webrtc-' + params.id].opt.stream = stream;

                  $(document).ready(function () {
                    Janus.init({
                      debug: "all",
                      callback: function () {
                        // Use a button to start the demo
                        _this.start = function () {
                          // Make sure the browser supports WebRTC
                          if (!Janus.isWebrtcSupported()) {
                            layer.msg("No WebRTC support... ");
                            return;
                          }

                          if (window['ezuikit-webrtc-' + params.id].opt.stsUrl.length == 0) {
                            layer.msg("Please input sts url... ");
                            return;
                          }

                          $(this).attr('disabled', true).unbind('click');
                          // 渲染房间，用户等头部信息
                          if (window['ezuikit-webrtc-' + params.id].opt.showHeader) {
                            var localUserNameValue = getQueryStringWithUrl("userId", window['ezuikit-webrtc-' + params.id].opt.stsUrl);
                            var customContainer = document.getElementById(params.id);
                            customContainer.style.minHeight = window['ezuikit-webrtc-' + params.id].opt.videoHeight + 'px';
                            customContainer.style.minWidth = window['ezuikit-webrtc-' + params.id].opt.videoWidth + 'px';
                            var headerContainer = document.createElement("div");
                            headerContainer.setAttribute("id", "ezuikit-webrtc-header-container");
                            var headerStyle = window['ezuikit-webrtc-' + params.id].opt.headerStyle;
                            headerContainer.style = headerStyle;
                            // 用户名
                            var userInfo = document.createElement('span');
                            userInfo.setAttribute("id", "localUserName");
                            userInfo.innerHTML = "用户名:" + localUserNameValue;
                            headerContainer.append(userInfo);
                            // 会议室ID
                            var roomInfo = document.createElement('span');
                            roomInfo.setAttribute("id", "roomInfoId");
                            roomInfo.innerHTML = "会议室ID:";
                            if (parseInt(window['ezuikit-webrtc-' + params.id].opt.roomParams.room) > 0) {
                              roomInfo.innerHTML = "会议室ID:" + window['ezuikit-webrtc-' + params.id].opt.roomParams.room;
                            }
                            headerContainer.append(roomInfo);

                            // 通话时长
                            var durationDOM = document.createElement('span');
                            durationDOM.setAttribute("id", "ezuikit-duration");
                            headerContainer.append(durationDOM);

                            // 结束
                            var stopDOM = document.createElement('span');
                            stopDOM.setAttribute("id", "ezuikitStop");
                            stopDOM.onclick = function () {
                              window['ezuikit-webrtc-' + params.id].opt.janus.destroy();
                              stopDurationTimer();
                              setTimeout(function () {
                                $("#" + params.id).empty();
                                $("#" + params.id).height(0);
                              }, 2000)
                              // window.location.reload();
                            }
                            headerContainer.append(stopDOM);

                            customContainer.append(headerContainer)
                          }

                          // Create session
                          window['ezuikit-webrtc-' + params.id].opt.janus = new Janus(
                            {
                              server: window['ezuikit-webrtc-' + params.id].opt.server,
                              success: function () {
                                // Attach to sts plugin
                                window['ezuikit-webrtc-' + params.id].opt.janus.attach(
                                  {
                                    plugin: "rtcgw.plugin.sts",
                                    opaqueId: window['ezuikit-webrtc-' + params.id].opt.opaqueId,
                                    success: function (pluginHandle) {
                                      $('#details').remove();
                                      window['ezuikit-webrtc-' + params.id].opt.sts = pluginHandle;
                                      Janus.log("Plugin attached! (" + window['ezuikit-webrtc-' + params.id].opt.sts.getPlugin() + ", id=" + window['ezuikit-webrtc-' + params.id].opt.sts.getId() + ")");
                                      var url = window['ezuikit-webrtc-' + params.id].opt.stsUrl;
                                      var body = { "request": "start", "url": url };
                                      //sts.send({"message": body});
                                      Janus.debug("Trying a createOffer too (audio/video sendrecv)");
                                      window['ezuikit-webrtc-' + params.id].opt.sts.createOffer(
                                        {
                                          // No media provided: by default, it's sendrecv for audio and video
                                          media: {
                                            audioRecv: true,
                                            videoRecv: true,
                                            data: false,
                                            audioSend: window['localAudioAvailable'],
                                            videoSend: window['localVideoAvailable'],
                                            video: "lowres",
                                          },
                                          simulcast: false,
                                          simulcast2: false,
                                          success: function (jsep) {
                                            Janus.debug("Got SDP!");
                                            Janus.debug(jsep);
                                            window['ezuikit-webrtc-' + params.id].opt.sts.send({ "message": body, "jsep": jsep });
                                            // $("#" + params.id).height(560);
                                            var previewContainer = document.getElementById("preview-container");
                                            if ($("#preview-container").length === 0) {
                                              previewContainer = document.createElement('div');
                                              previewContainer.setAttribute("class", "preview-container");
                                              previewContainer.setAttribute("id", "preview-container");
                                              var previewStyle = window['ezuikit-webrtc-' + params.id].opt.previewStyle;
                                              previewContainer.style = previewStyle;
                                              $("#" + params.id).append(previewContainer);
                                            } else {
                                              return false; // 已再onlocalstream中初始化
                                            }
                                            if ($("#focus-container").length === 0) {
                                              var focusContainer = document.createElement('div');
                                              focusContainer.setAttribute("class", "focus-container");
                                              focusContainer.setAttribute("id", "focus-container");
                                              $("#" + params.id).append(focusContainer);
                                            } else {
                                              return false;　// 已再onlocalstream中初始化
                                            }
                                            var data = {
                                              client_id: getQueryStringWithUrl("userId", window['ezuikit-webrtc-' + params.id].opt.stsUrl),
                                              pre_handle_id: '',
                                              ptype: "",
                                              username: "自己",
                                            };
                                            renderPreviewVideoItem(data, window['ezuikit-webrtc-' + params.id].opt.sts, window['ezuikit-webrtc-' + params.id].opt.cln.local.stream);
                                            var currentVideo = document.getElementById("ezuikit-webrtc-video-item-" + data.client_id)
                                            switchFocusVideo(currentVideo);
                                          },
                                          error: function (error) {
                                            Janus.error("WebRTC error:", error);
                                            layer.msg("WebRTC error... " + JSON.stringify(error));
                                          }
                                        });
                                    },
                                    error: function (error) {
                                      console.error("  -- Error attaching plugin...", error);
                                      layer.msg("Error attaching plugin... " + error);
                                    },
                                    consentDialog: function (on) {
                                      Janus.debug("Consent dialog should be " + (on ? "on" : "off") + " now");
                                    },
                                    iceState: function (state) {
                                      Janus.log("ICE state changed to " + state);
                                      switch (state) {
                                        case 'connected':
                                          console.log("ice connect success");
                                          startDurationTimer();
                                          break;
                                        case 'disconnected':
                                          console.log("ice connect loss");
                                          layer.msg("失去连接，请刷新重试");
                                          stopDurationTimer();
                                          // window.location.reload();
                                          break;
                                      }
                                    },
                                    mediaState: function (medium, on) {
                                      Janus.log("Janus " + (on ? "started" : "stopped") + " receiving our " + medium);
                                    },
                                    webrtcState: function (on) {
                                      Janus.log("Janus says our WebRTC PeerConnection is " + (on ? "up" : "down") + " now");
                                      // $("#audioleft").parent().unblock();
                                    },
                                    slowLink: function (uplink, lost) {
                                      Janus.warn("Janus reports problems " + (uplink ? "sending" : "receiving") +
                                        " packets on this PeerConnection (" + lost + " lost packets)");
                                    },
                                    onmessage: function (msg, jsep) {
                                      Janus.debug(" ::: Got a message :::");
                                      Janus.debug(msg);
                                      if (jsep !== undefined && jsep !== null) {
                                        Janus.debug("Handling SDP as well...");
                                        Janus.debug(jsep);
                                        window['ezuikit-webrtc-' + params.id].opt.sts.handleRemoteJsep({ jsep: jsep });
                                      }
                                      var result = msg["result"];
                                      if (result !== null && result !== undefined) {
                                        if (result === "done") {
                                          // The plugin closed
                                          return;
                                        }
                                        // Any loss?
                                        var status = result["status"];
                                        if (status === "slow_link") {
                                          //~ var bitrate = result["bitrate"];
                                          //~ toastr.warning("The bitrate has been cut to " + (bitrate/1000) + "kbps", "Packet loss?", {timeOut: 2000});
                                          //toastr.warning("Janus apparently missed many packets we sent, maybe we should reduce the bitrate", "Packet loss?", { timeOut: 2000 });
                                        }
                                      }
                                      var events = msg["event"];
                                      if (events !== null && events !== undefined) {
                                        if (events === "room_created") {
                                          var room = msg["room"];
                                          Janus.log("sts room created! " + room);
                                          if (window['ezuikit-webrtc-' + params.id].opt.showHeader && document.getElementById("roomInfoId")) {
                                            document.getElementById("roomInfoId").innerHTML = document.getElementById("roomInfoId").innerHTML + room;
                                          }
                                          if (typeof params.onMessage === 'function') {
                                            params.onMessage(PrefixCode(msg["code"],msg));
                                          }
                                        }
                                      }
                                      // 监听到第三方加入
                                      if (msg["ptype"] === "publisher") {
                                        newRemoteFeed(msg);
                                        if (typeof params.onMessage === 'function') {
                                          params.onMessage(PrefixCode(2,msg));
                                        }
                                      }
                                      // 监听到第三方退出
                                      if (msg["ptype"] === "exit" && msg['client_id']) {
                                        var exitId = "ezuikit-webrtc-video-item-" + msg['client_id'];
                                        // 用户退出提示语
                                        var exitUserName = msg['username'];
                                        setTimeout(function () {
                                          $("#" + exitId).parent().remove();
                                        }, 2000);
                                        if (typeof params.onMessage === 'function') {
                                          params.onMessage(PrefixCode(4,msg));
                                        }
                                      }
                                      // 房间不存在
                                      if (msg['type'] == 1 && msg["code"] == 35) {
                                        if (typeof params.onError === 'function') {
                                          //params.onError({ code: msg["code"], msg: "房间号不存在或房间已失效" });
                                          params.onError(PrefixCode(msg["code"],'房间号不存在或房间已失效'))
                                        }
                                      }
                                      // 设备忙
                                      if (msg['type'] == 1 && (msg["code"] == 501 || msg["code"] == 502)) {
  
                                        if (typeof params.onError === 'function') {
                                          // params.onError({ code: msg["code"], msg: "设备正忙，请稍后再试" });
                                          params.onError(PrefixCode(msg["code"],'设备正忙，请稍后再试'))
                                        }
                                      }
                                      // 房间已满
                                      if (msg['type'] == 1 && (msg["code"] == 17 || msg["code"] == 115)) {
                                        if (typeof params.onError === 'function') {
                                        // params.onError({ code: msg["code"], msg: "当前房间最多支持三方加入，请更换房间号" });
                                          params.onError(PrefixCode(msg["code"],'当前房间最多支持三方加入，请更换房间号'))
                                        }
                                      }
                                      // 房间已满
                                      if (msg['type'] == 1 && (msg["code"] == 504 || msg["code"] == 505|| msg["code"] == 5404)) {
                                        if (typeof params.onError === 'function') {
                                          // params.onError({ code: msg["code"], msg: "设备不在线" });
                                          params.onError(PrefixCode(msg["code"],'设备不在线'))
                                        }
                                      }
                                    },
                                    onlocalstream: function (stream) {
                                      Janus.debug(" ::: Got a local stream :::");
                                      Janus.debug(stream);
                                      window['ezuikit-webrtc-' + params.id].opt.cln.local.stream = stream;
                                    },
                                    onremotestream: function (stream) {
                                      Janus.debug(" ::: Got a remote stream :::");
                                      Janus.debug(stream);
                                      window['ezuikit-webrtc-' + params.id].opt.cln.remote.stream = stream;
                                      var data = {
                                        client_id: window['ezuikit-webrtc-' + params.id].opt.cln.remote.client_id || '',
                                        pre_handle_id: '',
                                        ptype: "",
                                        username: window['ezuikit-webrtc-' + params.id].opt.cln.remote.username || '',
                                      };
                                      renderPreviewVideoItem(data, window['ezuikit-webrtc-' + params.id].opt.sts, window['ezuikit-webrtc-' + params.id].opt.cln.remote.stream);
                                    },
                                    ondataopen: function (data) {
                                      Janus.log("The DataChannel is available!");
                                    },
                                    ondata: function (data) {
                                      Janus.debug("We got data from the DataChannel! " + data);
                                    },
                                    oncleanup: function () {
                                      Janus.log(" ::: Got a cleanup notification :::");
                                    }
                                  });
                              },
                              error: function (error) {
                                Janus.error(error);
                                layer.message("其他错误")
                                setTimeout(function () {
                                  // window.location.reload();
                                }, 2000);
                              },
                              destroyed: function () {
                              }
                            }, {
                            device: window['ezuikit-webrtc-' + params.id].opt.roomParams.dev,
                            channel: window['ezuikit-webrtc-' + params.id].opt.roomParams.channel,
                            token: window['ezuikit-webrtc-' + params.id].opt.stream,
                          });
                        };
                        // 自动执行
                        _this.start();
                        _this.stop = function () {
                          window['ezuikit-webrtc-' + params.id].opt.janus.destroy();
                          stopDurationTimer();
                          setTimeout(function () {
                            $("#" + params.id).empty();
                            $("#" + params.id).height(0);
                            document.getElementById(params.id).style.minHeight = '0px';
                            document.getElementById(params.id).style.minWidth = '0px';
                          }, 2000)
                        }
                        _this.setSelfAudioEnable = function (audioEnable) {
                          var stream = window['ezuikit-webrtc-' + params.id].opt.cln.local.stream;
                          var audioTracks = stream.getAudioTracks();
                          audioTracks[0].enabled = audioEnable;
                          var dom = $("#" + "ezuikit-webrtc-video-item-" + window['ezuikit-webrtc-' + params.id].opt.cln.local.userName).parent().children('.controls-container').children(".audio")[0];
                          if (dom) {
                            dom.className = audioEnable ? "controls-item audio using" : "controls-item audio unusing"
                          }
                          return audioTracks[0].enabled === audioEnable;
                        }
                        _this.setPeerAudioEnable = function (clintId, audioEnable) {
                          var peer = '';
                          if (clintId == window['ezuikit-webrtc-' + params.id].opt.cln.remote.client_id) {
                            peer = 'remote';
                          } else if (clintId == window['ezuikit-webrtc-' + params.id].opt.cln.third.client_id) {
                            peer = 'third';
                          } else {
                            console.log("未找到用户")
                            return -1;
                          }
                          var stream = window['ezuikit-webrtc-' + params.id].opt.cln[peer].stream;
                          var audioTracks = stream.getAudioTracks();
                          audioTracks[0].enabled = audioEnable;
                          var dom = $("#" + "ezuikit-webrtc-video-item-" + clintId).parent().children('.controls-container').children(".audio")[0];
                          if (dom) {
                            dom.className = audioEnable ? "controls-item audio using" : "controls-item audio unusing"
                          }
                          return audioTracks[0].enabled === audioEnable;
                        }
                        _this.setSelfVideoEnable = function (videoEnable) {
                          var stream = window['ezuikit-webrtc-' + params.id].opt.cln.local.stream;
                          var videoTracks = stream.getVideoTracks();
                          videoTracks[0].enabled = videoEnable;
                          var dom = $("#" + "ezuikit-webrtc-video-item-" + window['ezuikit-webrtc-' + params.id].opt.cln.local.userName).parent().children('.controls-container').children(".video")[0];
                          if (dom) {
                            dom.className = videoEnable ? "controls-item video using" : "controls-item video unusing"
                          }
                        }
                        _this.setPeerVideoEnable = function (clintId, videoEnable) {
                          var peer = '';
                          if (clintId == window['ezuikit-webrtc-' + params.id].opt.cln.remote.client_id) {
                            peer = 'remote';
                          } else if (clintId == window['ezuikit-webrtc-' + params.id].opt.cln.third.client_id) {
                            peer = 'third';
                          } else {
                            console.log("未找到用户")
                            return -1;
                          }
                          var stream = window['ezuikit-webrtc-' + params.id].opt.cln[peer].stream;
                          var videoTracks = stream.getVideoTracks();
                          videoTracks[0].enabled = videoEnable;
                          var dom = $("#" + "ezuikit-webrtc-video-item-" + clintId).parent().children('.controls-container').children(".video")[0];
                          if (dom) {
                            dom.className = videoEnable ? "controls-item video using" : "controls-item video unusing"
                          }
                        }
                        _this.fullScreen = function () {
                          var fullarea = $("#focus-container").children('.ezuikit-webrtc-video-container')[0];
                          if (fullarea.requestFullscreen) {
                            fullarea.requestFullscreen();
                          } else if (fullarea.webkitRequestFullScreen) {
                            fullarea.webkitRequestFullScreen();
                          } else if (fullarea.mozRequestFullScreen) {
                            fullarea.mozRequestFullScreen();
                          } else if (fullarea.msRequestFullscreen) {
                            // IE11
                            fullarea.msRequestFullscreen();
                          }
                          $(fullarea).children("video").width("100%");
                          $(fullarea).children("video").height("100%");

                          //监听退出全屏事件
                          window.addEventListener("fullscreenchange", function (e) {
                            console.log("checkFull", checkFull());
                            setTimeout(() => {
                              if (!checkFull()) {
                                //要执行的动作
                                $(fullarea).children("video").width(window['ezuikit-webrtc-' + params.id].opt.videoWidth + 'px');
                                $(fullarea).children("video").height(window['ezuikit-webrtc-' + params.id].opt.videoHeight + 'px');
                              }
                            }, 100)
                            function checkFull() {
                              var isFull = document.fullscreen || document.webkitIsFullScreen || document.mozFullScreen;
                              //to fix : false || undefined == undefined
                              if (isFull === undefined) { isFull = false; }
                              return isFull;
                            }
                          })
                        }
                        _this.exitFullScreen = function () {
                          // 判断各种浏览器，找到正确的方法
                          var exitMethod = document.exitFullscreen || //W3C
                            document.mozCancelFullScreen || //FireFox
                            document.webkitExitFullscreen || //Chrome等
                            document.webkitExitFullscreen; //IE11
                          if (exitMethod) {
                            exitMethod.call(document);
                          } else if (typeof window.ActiveXObject !== "undefined") { //for Internet Explorer
                            var wscript = new ActiveXObject("WScript.Shell");
                            if (wscript !== null) {
                              wscript.SendKeys("{F11}");
                            }
                          }

                        }
                      },
                    });
                  });
                }

              }else {
                debugger
                if (typeof params.onError === 'function') {
                  params.onError(PrefixCode(data.code,data.msg))
                }
              }
            }
            function apiError(err) {
              if (typeof params.onError === 'function') {
                params.onError(PrefixCode(-1,err))
              }

            }
            request(
              window['ezuikit-webrtc-' + params.id].opt.apiDomain,
              'POST',
              {
                accessToken: window['ezuikit-webrtc-' + params.id].opt.accessToken,
                deviceSerial: window['ezuikit-webrtc-' + params.id].opt.roomParams.dev,
                channelNo: window['ezuikit-webrtc-' + params.id].opt.roomParams.channel
              },
              '',
              apiSuccess,
              apiError
            );
            // api - end
            function newRemoteFeed(data) {
              // 处理第一路远程
              if (!window['ezuikit-webrtc-' + params.id].opt.firstRemoteAttached) {
                window['ezuikit-webrtc-' + params.id].opt.firstRemoteAttached = true;
                // 渲染第一个远程元素名称
                if (data.username) {
                  if (document.getElementById("name-first-remote")) {
                    document.getElementById("name-first-remote").innerHTML = data.username;
                  }
                  window['ezuikit-webrtc-' + params.id].opt.cln.remote.username = data.username;
                  //$("#name-first-remote").attr("id","name-" + data.client_id);
                }
                if (data.client_id) {
                  //  document.getElementById("name-first-remote").innerHTML = data.username;
                  window['ezuikit-webrtc-' + params.id].opt.cln.remote.client_id = data.client_id;
                  renderPreviewVideoItem(data, remoteFeed, window['ezuikit-webrtc-' + params.id].opt.cln.remote.stream)
                  //$("#ezuikit-webrtc-video-item-first-remote").attr("id","ezuikit-webrtc-video-item-"+ data.client_id)
                }
                return false;
              }
              // 处理第二路远程
              console.log("subscribe下一个远程视频- 开始", data);
              // A new feed has been published, create a new plugin handle and attach to it as a subscriber
              var client_id = window['ezuikit-webrtc-' + params.id].opt.cln.remote.client_id || ''; //Math.random();
              var username = '';
              if (data.client_id) {
                client_id = data.client_id;
              }
              if (data.username) {
                username = data.username;
              }

              var remoteFeed = null;
              window['ezuikit-webrtc-' + params.id].opt.janus.attach(
                {
                  plugin: "rtcgw.plugin.sts",
                  opaqueId: window['ezuikit-webrtc-' + params.id].opt.opaqueId,
                  success: function (pluginHandle) {
                    $('#details').remove();
                    remoteFeed = pluginHandle;
                    Janus.log("Plugin attached! (" + window['ezuikit-webrtc-' + params.id].opt.sts.getPlugin() + ", id=" + window['ezuikit-webrtc-' + params.id].opt.sts.getId() + ")");
                    var subscribe = { "request": "subscriber", "pre_handle_id": data.pre_handle_id, "client_id": data.client_id };
                    Janus.debug("Trying a createOffer too (audio/video sendrecv)");
                    remoteFeed.createOffer(
                      {
                        media: { audio: true, video: true, data: false },	// Audio only
                        simulcast: false,
                        simulcast2: false,
                        success: function (jsep) {
                          Janus.debug("remoteFeed createOffer Got SDP!");
                          Janus.debug(jsep);
                          remoteFeed.send({ "message": subscribe, "jsep": jsep });
                        },
                        error: function (error) {
                          Janus.error("remoteFeed WebRTC error:", error);
                          layer.msg("remoteFeed WebRTC error... " + JSON.stringify(error));
                        }
                      });
                  },
                  error: function (error) {
                    console.error("remoteFeed  -- Error attaching plugin...", error);
                  },
                  consentDialog: function (on) {
                    Janus.debug("remoteFeed Consent dialog should be " + (on ? "on" : "off") + " now");
                  },
                  iceState: function (state) {
                    Janus.log("remoteFeed ICE state changed to " + state);
                  },
                  mediaState: function (medium, on) {
                    Janus.log("remoteFeed Janus " + (on ? "started" : "stopped") + " receiving our " + medium);
                  },
                  webrtcState: function (on) {
                    Janus.log("remoteFeed Janus says our WebRTC PeerConnection is " + (on ? "up" : "down") + " now");
                  },
                  slowLink: function (uplink, lost) {
                    Janus.warn("remoteFeed Janus reports problems " + (uplink ? "sending" : "receiving") +
                      " packets on this PeerConnection (" + lost + " lost packets)");
                  },
                  onmessage: function (msg, jsep) {
                    Janus.debug("remoteFeed ::: Got a message :::");
                    Janus.debug(msg);
                    if (jsep !== undefined && jsep !== null) {
                      Janus.debug("remoteFeed Handling SDP as well...");
                      Janus.debug(jsep);
                      remoteFeed.handleRemoteJsep({ jsep: jsep });
                    }
                    var result = msg["result"];
                    if (result !== null && result !== undefined) {
                    }
                  },
                  onlocalstream: function (stream) {
                    // 远程无需监听本地stream变化
                  },
                  onremotestream: function (stream) {
                    Janus.debug("remoteFeed ::: Got a remote stream :::", client_id);
                    Janus.debug(stream);
                    window['ezuikit-webrtc-' + params.id].opt.cln.third.stream = stream;
                    window['ezuikit-webrtc-' + params.id].opt.cln.third.client_id = client_id;
                    window['ezuikit-webrtc-' + params.id].opt.cln.third.username = username;
                    renderPreviewVideoItem(data, remoteFeed, window['ezuikit-webrtc-' + params.id].opt.cln.third.stream);
                  },
                  ondataopen: function (data) {
                    Janus.log("remoteFeed The DataChannel is available!");
                  },
                  ondata: function (data) {
                    Janus.debug("remoteFeed We got data from the DataChannel! " + data);
                  },
                  oncleanup: function () {
                    Janus.log("remoteFeed ::: Got a cleanup notification :::");
                  }
                });
            };
            // 渲染预览视频公共方法
            function renderPreviewVideoItem(data, remoteFeed, stream) {
              console.log(data);
              var client_id = window['ezuikit-webrtc-' + params.id].opt.cln.remote.client_id; //Math.random();
              var username = '';
              var isLocalVideo = false;
              var previewContainer = document.getElementById("preview-container");
              if (!data.client_id) {
                return false;
              }
              if (!previewContainer) {
                return false;
              }

              if (data.client_id) {
                client_id = data.client_id;
              }
              if (data.username) {
                username = data.username;
              }
              if (!stream && window['localAudioAvailable']) {
                return false;
              }
              if (!stream && !window['localVideoAvailable']) {
                console.log("未找到媒体流");
                var videoContainer2 = document.createElement('div');//'<div class="ezuikit-webrtc-video-container"></div>';
                videoContainer2.setAttribute('class', "ezuikit-webrtc-video-container");

                var noVideo = document.createElement('img');
                noVideo.setAttribute("src", "https://resource.ys7cloud.com/group2/M00/00/03/CtwQFl8-f-WASBjMAAAT6-Nz0Lc253.png");
                noVideo.style.position = 'absolute';
                noVideo.style.width = '50%';
                noVideo.style.left = '25%';
                noVideo.style.top = '25%';
                videoContainer2.append(noVideo);
                // 预览视频头部信息展示
                var titleContainer = document.createElement('div');
                titleContainer.setAttribute('class', "title-container");
                var info = document.createElement("span");
                info.innerHTML = data.username;
                // var voice = document.createElement("span");
                info.setAttribute("id", "name-" + client_id);
                titleContainer.append(info);

                videoContainer2.append(titleContainer);

                // 摄像头，麦克风控制
                var controlsContainer = document.createElement('div');
                controlsContainer.setAttribute("class", "controls-container");
                // 摄像头
                var videoControl = document.createElement('div');

                var classValue = 'controls-item video unusing';
                videoControl.setAttribute("class", classValue);
                controlsContainer.appendChild(videoControl);
                // 麦克风
                var audioControl = document.createElement('div');

                var classValue = 'controls-item audio unusing';
                audioControl.setAttribute("class", classValue);

                controlsContainer.appendChild(audioControl);
                var video = document.createElement('video');
                video.setAttribute("id", "ezuikit-webrtc-video-item-" + client_id);
                videoContainer2.append(video);
                videoContainer2.appendChild(controlsContainer);
                previewContainer.appendChild(videoContainer2);

                return false;
              }
              // 音视频元素
              var VideoItemVideoTracks = stream.getVideoTracks();
              var VideoItemAudioTracks = stream.getAudioTracks();
              console.log("要渲染的音视频tracks", VideoItemVideoTracks, VideoItemAudioTracks)

              var videoId = 'ezuikit-webrtc-video-item-' + client_id;
              if (videoId == ("ezuikit-webrtc-video-item-" + getQueryStringWithUrl("userId", window['ezuikit-webrtc-' + params.id].opt.stsUrl))) {
                // 当前视频是本地视频；
                isLocalVideo = true;
              }
              if (window['ezuikit-webrtc-' + params.id].opt.onlyDevice) {
                if (isLocalVideo) {
                  var enabledAudio = window['ezuikit-webrtc-' + params.id].opt.useMic; // 本地根据用户选择是否开启摄像头展示
                  if (VideoItemAudioTracks.length > 0) {
                    VideoItemAudioTracks[0].enabled = enabledAudio;
                  } else {
                    console.log("用户开启了麦克风，但未获取到本地音频");
                  }
                  return false;
                } else if (window['ezuikit-webrtc-' + params.id].opt.roomParams.dev !== username) {
                  return false;
                }
              }
              if ($('#' + videoId).length === 0) {
                // 本地视频实例
                // video-item1 end
                var video = document.createElement('video'); //'<video id="ezuikit-webrtc-loacal-video-item" width=460 height=480 autoplay playsinline muted="muted"></video>';
                video.setAttribute("id", videoId);
                video.setAttribute("width", 120);
                video.setAttribute("autoplay", true);
                video.setAttribute("height", 90);
                video.setAttribute("loop", true);
                video.setAttribute("visibility", 'visible');
                // video.setAttribute("controls", true);
                if (videoId == ("ezuikit-webrtc-video-item-" + getQueryStringWithUrl("userId", window['ezuikit-webrtc-' + params.id].opt.stsUrl))) {
                  video.muted = true;
                }
                // 视频容器
                var videoContainer2 = document.createElement('div');//'<div class="ezuikit-webrtc-video-container"></div>';
                videoContainer2.setAttribute('class', "ezuikit-webrtc-video-container");

                var noVideo = document.createElement('img');
                noVideo.setAttribute("src", "https://resource.ys7cloud.com/group2/M00/00/03/CtwQFl8-f-WASBjMAAAT6-Nz0Lc253.png");
                noVideo.style.position = 'absolute';
                noVideo.style.width = '50%';
                noVideo.style.left = '25%';
                noVideo.style.top = '25%';
                noVideo.style.display = 'none';

                videoContainer2.append(noVideo);

                // 预览视频头部信息展示
                var titleContainer = document.createElement('div');
                titleContainer.setAttribute('class', "title-container");
                var info = document.createElement("span");
                info.innerHTML = username;
                // var voice = document.createElement("span");
                info.setAttribute("id", "name-" + client_id);

                titleContainer.append(info);

                var soundGif = document.createElement("span");
                soundGif.setAttribute("class", "voice-gif");
                soundGif.setAttribute("id", "voice-gif-" + client_id);
                soundGif.style.display = 'none';
                titleContainer.append(soundGif);

                videoContainer2.append(titleContainer);
                videoContainer2.append(video);
                video.onclick = function () {
                  var focusVideo = document.getElementById("ezuikit-webrtc-active-video-item")
                  console.log("点击video")
                  switchFocusVideo(video)
                  // videoContainer1.setAttribute("class","hidden");
                }

                // 摄像头，麦克风控制
                var controlsContainer = document.createElement('div');
                controlsContainer.setAttribute("class", "controls-container");
                // 摄像头
                var videoControl = document.createElement('div');

                var enabledVideo = true; // 默认开启其他端视频 //VideoItemVideoTracks && VideoItemVideoTracks[0].enabled;
                if (isLocalVideo) {
                  if (VideoItemVideoTracks && VideoItemVideoTracks[0]) {
                    VideoItemVideoTracks[0].enabled = window['ezuikit-webrtc-' + params.id].opt.useCam;
                    noVideo.style.display = window['ezuikit-webrtc-' + params.id].opt.useCam ? 'none' : 'inline-block';
                  } else {
                    console.log("用户开启了视频，但未获取到本地视频");
                  }
                }

                var classValue = enabledVideo ? 'controls-item video using' : 'controls-item video unusing';
                videoControl.setAttribute("class", classValue);
                controlsContainer.appendChild(videoControl);
                videoControl.onclick = function () {
                  var VideoItemVideoTracks = stream.getVideoTracks();
                  var VideoItemAudioTracks = stream.getAudioTracks();
                  var enabledVideo = VideoItemVideoTracks && VideoItemVideoTracks.length > 0 && VideoItemVideoTracks[0].enabled;
                  if (VideoItemVideoTracks && VideoItemVideoTracks.length > 0) {
                    var enabledVideo = VideoItemVideoTracks[0].enabled;
                    if (enabledVideo) {
                      VideoItemVideoTracks[0].enabled = false;
                      // video.style.display = 'none';
                      videoControl.setAttribute("class", "controls-item video unusing");
                      noVideo.style.display = 'inline-block';

                    } else {
                      VideoItemVideoTracks[0].enabled = true;
                      // video.style.display = 'inline-block';
                      videoControl.setAttribute("class", "controls-item video using");
                      noVideo.style.display = 'none';
                    }
                  } else {

                    if (enabledVideo) {
                      // video.style.display = 'none';
                      videoControl.setAttribute("class", "controls-item video unusing");
                      noVideo.style.display = 'inline-block';
                      enabledVideo = false;

                    } else {
                      // video.style.display = 'inline-block';
                      videoControl.setAttribute("class", "controls-item video using");
                      enabledVideo = true;
                    }
                  }
                  // 判断是否预览本地，需要控制摄像头
                  // ezuikit-webrtc-video-item-user_creater
                  if (videoId == ("ezuikit-webrtc-video-item-" + getQueryStringWithUrl("userId", window['ezuikit-webrtc-' + params.id].opt.stsUrl))) {
                    console.log("判断是聚焦本地，需要控制摄像头");
                    var videoTracks = window['ezuikit-webrtc-' + params.id].opt.cln.local.stream.getVideoTracks();
                    console.log("关闭自己摄像头", videoTracks);
                    videoTracks[0].enabled = !enabledVideo;
                  }
                }
                // 麦克风
                var audioControl = document.createElement('div');
                var enabledAudio = true; //VideoItemAudioTracks && VideoItemAudioTracks[0].enabled;

                if (isLocalVideo) {
                  enabledAudio = window['ezuikit-webrtc-' + params.id].opt.useMic; // 本地根据用户选择是否开启摄像头展示
                  if (VideoItemAudioTracks.length > 0) {
                    VideoItemAudioTracks[0].enabled = window['ezuikit-webrtc-' + params.id].opt.useMic;
                  } else {
                    console.log("用户开启了麦克风，但未获取到本地音频");
                  }
                }

                var classValue = enabledAudio ? 'controls-item audio using' : 'controls-item audio unusing';
                audioControl.setAttribute("class", classValue);

                controlsContainer.appendChild(audioControl);
                audioControl.onclick = function () {
                  var value = VideoItemAudioTracks && VideoItemAudioTracks[0].enabled // video.muted;
                  // video.muted = !value;
                  VideoItemAudioTracks[0].enabled = !VideoItemAudioTracks[0].enabled;
                  if (value) {
                    audioControl.setAttribute("class", "controls-item audio unusing");
                  } else {
                    audioControl.setAttribute("class", "controls-item audio using");
                  }
                  // 判断如果是预览本地，需要控制麦克风
                  // ezuikit-webrtc-video-item-user_creater
                  if (videoId == ("ezuikit-webrtc-video-item-" + getQueryStringWithUrl("userId", window['ezuikit-webrtc-' + params.id].opt.stsUrl))) {
                    console.log("判断是预览本地，需要控制麦克风");
                    var audioTracks = window['ezuikit-webrtc-' + params.id].opt.cln.local.stream.getAudioTracks();
                    console.log("关闭自己麦克风", audioTracks);
                    audioTracks[0].enabled = !value;
                    console.log("关闭自己麦克风-结果", audioTracks, audioTracks[0].enabled);
                  }
                }
                videoContainer2.appendChild(controlsContainer);
                previewContainer.appendChild(videoContainer2);
                // video-item end
              }
              Janus.attachMediaStream($('#' + videoId).get(0), stream);
              var videoTracks = stream.getVideoTracks();
              if (videoTracks === null || videoTracks === undefined || videoTracks.length === 0) {
                // No remote video
                console.log("检测到没有视频 client_id", client_id);
                // $("#" + "ezuikit-webrtc-video-item-" + client_id).siblings()[0].setAttribute("src","./networkerror.png")
                $("#" + "ezuikit-webrtc-video-item-" + client_id).siblings()[0].style.display = "inline-block";
              } else {
                console.log("检测到有视频 client_id", client_id)
                //$("#" + "ezuikit-webrtc-video-item-" + client_id).siblings()[0].setAttribute("src","https://resource.ys7cloud.com/group2/M00/00/03/CtwQFl8-f-WASBjMAAAT6-Nz0Lc253.png")
                if (videoTracks[0].enabled) {
                  $("#" + "ezuikit-webrtc-video-item-" + client_id).siblings()[0].style.display = "none";
                } else {
                  $("#" + "ezuikit-webrtc-video-item-" + client_id).siblings()[0].style.display = "inline-block";
                }
              }

              // 音频控制
              try {
                window.AudioContext = window.AudioContext || window.webkitAudioContext;
                window.audioContext = new AudioContext();
              } catch (e) {
                layer.msg('Web Audio API not supported.');
              }

              try {
                const soundMeter = window.soundMeter = new SoundMeter(window.audioContext);
                soundMeter.connectToSource(stream, function (e) {
                  if (e) {
                    console.log(e);
                    return;
                  }
                  var soundGif = document.getElementById("voice-gif-" + client_id);
                  setInterval(() => {
                    //console.log("soundMeter.instant", soundMeter.instant.toFixed(2) * 100);
                    // document.getElementById("voice-" + client_id).innerHTML = '音频流:' + parseInt(soundMeter.instant.toFixed(2)*100);
                    if (parseInt(soundMeter.instant.toFixed(3) * 1000) > 0) {
                      if (soundGif) {
                        soundGif.style.display = "inline-block";
                      }
                    } else {
                      if (soundGif) {
                        soundGif.style.display = "none";
                      }
                    }
                    // instantMeter.value = instantValueDisplay.innerText = soundMeter.instant.toFixed(2);
                  }, 500);
                });
              } catch (e) {
                console.log(e)
              }
              var currentVideo = document.getElementById("ezuikit-webrtc-video-item-" + client_id);
              if (getQueryStringWithUrl('dev', window['ezuikit-webrtc-' + params.id].opt.stsUrl) === username) {
                switchFocusVideo(currentVideo);
              }
            }
            // 切换聚焦视频
            function switchFocusVideo(currentVideo) {
              var focusContainer = $("#focus-container");
              var previewContainer = $("#preview-container");
              // 获取聚焦区当前视频
              var focusVideo = null;
              if (focusContainer.children() && focusContainer.children().length > 0) {
                focusVideo = focusContainer.children()[0];
              }
              if (focusVideo && $($(focusVideo).children("video")).attr("id") === currentVideo.id) {
                return false;
              }
              if (!currentVideo) {
                return false;
              }
              // 清空聚焦区视频容器
              focusContainer.remove(".ezuikit-webrtc-video-container");
              // 将视频添加到聚焦区
              $("#" + currentVideo.id).attr("width", window['ezuikit-webrtc-' + params.id].opt.videoWidth);
              $("#" + currentVideo.id).attr("height", window['ezuikit-webrtc-' + params.id].opt.videoHeight);
              // $("#" + currentVideo.id).attr("max-width",640);
              // $("#" + currentVideo.id).attr("max-height",480);
              var currentVideoContainer = $("#" + currentVideo.id).parent();
              focusContainer.append(currentVideoContainer);
              // 将视频添加到预览区
              if (focusVideo) {
                $($(focusVideo).children("video")).attr("width", 120);
                $($(focusVideo).children("video")).attr("height", 90);
                previewContainer.append(focusVideo);
              }
              // 本地视频静音
              if (currentVideo.id === ('ezuikit-webrtc-video-item-' + getQueryStringWithUrl("userId", window['ezuikit-webrtc-' + params.id].opt.stsUrl))) {
                currentVideo.muted = true;
              }
            }
            //计数器
            function startDurationTimer() {
              window['ezuikit-webrtc-' + params.id].opt.durationTimer = setInterval(function () {
                window['ezuikit-webrtc-' + params.id].opt.count++;
                // console.log(count)
                // 需要改变页面上时分秒的值
                var time = showNum(parseInt(window['ezuikit-webrtc-' + params.id].opt.count / 60 / 60)) + ':' + showNum(parseInt(window['ezuikit-webrtc-' + params.id].opt.count / 60) % 60) + ':' + showNum(window['ezuikit-webrtc-' + params.id].opt.count % 60)
                // console.log(time);
                if (window['ezuikit-webrtc-' + params.id].opt.showHeader && document.getElementById("ezuikit-duration")) {
                  document.getElementById("ezuikit-duration").innerHTML = '通话时长：' + time;
                }
              }, 1000);
              function showNum(num) {
                if (num < 10) {
                  return '0' + num
                }
                return num
              }
            }
            // 结束计数器
            function stopDurationTimer() {
              if (window['ezuikit-webrtc-' + params.id].opt.durationTimer) {
                clearInterval(window['ezuikit-webrtc-' + params.id].opt.durationTimer);
              }
              if (window['ezuikit-webrtc-' + params.id].opt.showHeader && document.getElementById("ezuikit-duration")) {
                document.getElementById("ezuikit-duration").innerHTML = '通话时长：' + '00:00:00'
              }
            }


          };



          function SoundMeter(context) {
            this.context = context;
            this.instant = 0.0;
            this.slow = 0.0;
            this.clip = 0.0;
            this.script = context.createScriptProcessor(2048, 1, 1);
            const that = this;
            this.script.onaudioprocess = function (event) {
              const input = event.inputBuffer.getChannelData(0);
              let i;
              let sum = 0.0;
              let clipcount = 0;
              for (i = 0; i < input.length; ++i) {
                sum += input[i] * input[i];
                if (Math.abs(input[i]) > 0.99) {
                  clipcount += 1;
                }
              }
              that.instant = Math.sqrt(sum / input.length);
              that.slow = 0.95 * that.slow + 0.05 * that.instant;
              that.clip = clipcount / input.length;
            };
          }

          SoundMeter.prototype.connectToSource = function (stream, callback) {
            console.log('SoundMeter connecting');
            try {
              this.mic = this.context.createMediaStreamSource(stream);
              this.mic.connect(this.script);
              // necessary to make sample run, but should not be.
              this.script.connect(this.context.destination);
              if (typeof callback !== 'undefined') {
                callback(null);
              }
            } catch (e) {
              console.error(e);
              if (typeof callback !== 'undefined') {
                callback(e);
              }
            }
          };

          SoundMeter.prototype.stop = function () {
            this.mic.disconnect();
            this.script.disconnect();
          };

          window.EZUIKitWebrtcRoom = EZUIKitWebrtcRoom;
          return EZUIKitWebrtcRoom;
        })
      })
    })
  })
});