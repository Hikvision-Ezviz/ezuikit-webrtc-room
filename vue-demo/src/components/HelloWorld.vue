<template>
  <button v-on:click="init">init</button>
  <div id="ezuikit-webrtc-container"></div>
</template>

<script>
/* eslint-disable */
import EZUIKitWebrtcRoom from "./ezuikit-webrtc-room";
let myEZUIKit;
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  mounted: () => {
  },
    // 在 `methods` 对象中定义方法
  methods: {
    init: function (event) {
      console.log("EZUIKitWebrtcRoom",EZUIKitWebrtcRoom)
			var deviceSerial = "C69594192";
			var accessToken = "at.cnavogr85d6hkmu81gh0fpvi9b9b7rwq-45gad0262n-0tewrau-5ovkyocot";
			var channel = "1";
			var userName = "user";
			var password = "12345";

			var opt = {
				id: "ezuikit-webrtc-container",
				room: '0',
				videoWidth: 600,
				videoHeight: 400,
				useMic: true,
				useCam: true,
				deviceSerial: deviceSerial,
				channel: channel,
				accessToken: accessToken,
				userName: userName,
				password: password,
				type: 'create',
				previewStyle: {
				},
				headerStyle: {
				},
				// showHeader: false,
				onMessage: function(message){
					console.log("onmessage",message);
				},
				onError: function(error){
					console.log("onerror",error);
					layer.msg(error.data)
				}
				// onRoomCreated:function(data){
				// 	console.log("room created callback",data);
				// },
				// onPeerPublisher: function(data){
				// 	console.log("peer publisher callback",data);
				// },
				// onPeerExit: function(data){
				// 	console.log("peer exit callback",data);
				// }
			}
			myEZUIKit = new window.EZUIKitWebrtcRoom(opt);
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
