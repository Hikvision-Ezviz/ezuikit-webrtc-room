# webrtc视频通话使用文档
## 特性
web端A和设备两方音视频通话；

web端A和设备以及web端B三方音视频通话；

web端通过本文档提供api控制本地音视频，其他端音频视频等功能；

## 快速上手
引入依赖

```
<script type="text/javascript" src="./ezuikit-webrtc-room.js"></script>
```
创建DOM容器
```
<div id="ezuikit-webrtc-container"></div>
```
初始化

```
var opt = {
  id: "ezuikit-webrtc-container",//容器ID
  deviceSerial: deviceSerial, // 设备序列号
  channel: channel,           // 通道号
  accessToken: accessToken,   // 用户accessToken
  userName: userName,         // 自定义用户名
  type: 'create',             // 呼叫类型
}
var myEZUIKit = new EZUIKitWebrtcRoom(opt);
```

### API

开关自己的音频： setSelfAudioEnable

简要描述

设置本地麦克风状态

参数

期望设置的麦克风状态（Boolean）

请求示例

```
myEZUIKit.setAudioEnable(true) // 打开自己音频
myEZUIKit.setAudioEnable(false) // 关闭自己音频
```

开关自己的视频： setSelfVideoEnable

简要描述

设置本地摄像头状态

参数

期望设置的摄像头状态（Boolean）

请求示例
```
myEZUIKit.setSelfVideoEnable(true) // 打开自己视频
myEZUIKit.setSelfVideoEnable(false) // 关闭自己的视频
 ```


开关其他成员的的音频： setPeerAudioEnable

简要描述

设置其他成员音频状态

参数

其他成员唯一ID

期望设置的音频状态（Boolean）

请求示例
```
myEZUIKit.setPeerAudioEnable(clientId,true) // 打开其他成员音频
myEZUIKit.setPeerAudioEnable(clientId,false) // 关闭其他成员音频
 ```

 开关其他成员的的视频频： setPeerVideoEnable

简要描述

设置其他成员视频状态

参数

其他成员唯一ID

期望设置的视频状态（Boolean）

请求示例
```
myEZUIKit.setPeerVideoEnable(clientId,true) // 打开其他成员视频
myEZUIKit.setPeerVideoEnable(clientId,false) // 关闭其他成员视频
 ```
 全屏： fullScreen

简要描述

设置主视频全屏

参数

无

请求示例
```
myEZUIKit.fullScreen()
```
退出全屏： exitFullScreen

简要描述

退出全屏

参数

无

请求示例
```
myEZUIKit.exitFullScreen()
 ```

 ## 使用说明
 ### 初始化参数
参数名|类型|是否必填|默认值|示例|说明
-|-|-|-|-|-|
id|	string|	是|	NULL|	ezuikit-webrtc-container	|唯一容器ID
userName|string|	是	|NULL|	张三|用户名|10位以内中英文数字下划线组合
deviceSerial|string	|是	|NULL	|C61594192|	设备序列号
channel	|string	|是|	NULL	|1|	通道号|
accessToken|string|	是|	NULL|	at.at6n9p...itw0|用户accessToken，和设备序列号/通道号,实现设备视频及音视频通话鉴权
type|string|是|NULL|create|create: 创建房间,join： 加入房间
room|string|否|10|0|	房间号，加入房间需要填写
videoWidth|int|否|600|600|视频宽度
videoHeight	|int|	否|	400	|400	|视频高度
useMic	|boolean	|	否	|	true		|true		|进入房间是否默认开启麦克风
useCam	|boolean	|	否	|	true		|true		|进入房间是否默认开启摄像头
previewStyle|object|	否	|`{bottom:60,left: 0}`|`{bottom: 0,left: 0, //位置相关display: "none" // 不展示}`|小窗视频容器样式配置，可设置位置，是否隐藏等
headerStyle|object|	否	|`{}`|`{display: "none" // 不展示}`|头部容器样式配置样式，可设置位置，是否隐藏等
onMessage|	function	|否	|NULL	|`function(error) =>console.log(error)`|事件捕获，可获取错误码，错误信息，详见消息列表
onError|	function	|否	|NULL	|`function(error) =>console.log(error)`|错误事件捕获，可获取错误码，错误信息,详见错误码列表

## 消息列表

消息码|消息内容|消息体
-|-|-|
|10200003	|房间创建成功|```{event: "room_created"room: 1520675 // 房间号}```
|10200002	|其他成员加入|```{client_id: 54 // 成员唯一ID,ptype: ,"publisher"username: "D88600067" // 成员用户名}```
|10200004	|其他成员退出|```{client_id: 54 // 成员唯一ID,ptype: ,"publisher"username: "D88600067" // 成员用户名}```


## 错误码

错误码|说明
-|-|
10220002|设备不存在
10200035|	房间号不存在或房间已失效
10200501|	设备正忙，请稍后再试
10200502|	设备无响应
10200017|	成员数超限，最大支持三方加入
10200115|	达到最大连接数
10200504|	设备不在线
