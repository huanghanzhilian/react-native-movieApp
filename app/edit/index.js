import React, { Component } from 'react';
var Icon=require('react-native-vector-icons/Ionicons');
import  Video from 'react-native-video'
import * as ImagePicker from 'react-native-image-picker';

//组件或者工具模块 就是本地项目模块
var request=require('../common/request')
var config=require('../common/config');

import {
  TabBarIOS,
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
  AsyncStorage,
  AlertIOS,
  ProgressViewIOS

} from 'react-native';

var width=Dimensions.get('window').width//获取屏幕宽度
var height=Dimensions.get('window').height

//选择视频使用参数
var videoOptions = {
  title: '选着视频',
  cancelButtonTitle:'取消',//取消按钮
  takePhotoButtonTitle:'录制 10 秒视频',
  chooseFromLibraryButtonTitle:'选着已有视频',
  videoQuality:'medium',//视频质量
  mediaType:'video',//视频的格式
  durationLimit:10,//录制时候控制多少秒
  noData:false,//如果是true就不会转成base64
  storageOptions: { //
    skipBackup: true, 
    path: 'images'
  }
};  

var Edit =React.createClass({
  //初始状态时，通过属性状态
  getInitialState: function() {
    var user=this.props.user||{}
    return {
      user:user,

      previeVideo:null,//是否选择视频

      //video标签参数
      rate:1,
      muted:true,//是否静音
      resizeMode:'contain',
      repeat:false,

      playing:false,//播放结束
      videoLoaded:false,//视频加载中动画  加载完毕
      videoProgress:0.01,//进度条
      videoTotal:0,//视频整个时间
      currentTime:0,//当前时间
      paused:false,//是否暂停

      //视频上传参数
      video:null,
      videoUploading:false,//是否正在上传中
      videoUploaded:false,//是否上传成功
      videoUploadedProgress:0,//视频上传进度

    }
  },
  //安装过  3
  componentDidMount(){
    var that=this
    AsyncStorage.getItem('user')
      .then((data)=>{
        var user

        if(data){
          //转成json
          user=JSON.parse(data)
        }
        if(user&&user.accessToken){
          this.setState({
            user:user
          })
        }
      })   
  },
  render: function() {
    return (
      <View style={styles.container}>
        <View style={styles.toolbar}>
          <Text style={styles.toolbarTitle}>
            {this.state.previeVideo?'点击按钮配音':'理解狗狗从配音开始'}
          </Text>
          {
            this.state.previeVideo&&this.state.videoUploaded
            ?<Text onPress={this._pickVideo} style={styles.toolbarExtra}>更换视频</Text>
            :null
          }
          
        </View>
        <View style={styles.page}>
          {
            this.state.previeVideo
            ?<View style={styles.videoContainer}>
              <View style={styles.videoBox}>
                <Video
                  ref='videoPlayer'
                  source={{uri: this.state.previeVideo}}
                  style={styles.video}
                  volume={1.0}
                  paused={this.state.paused}
                  rate={this.state.rate}
                  muted={this.state.muted}
                  resizeMode={this.state.resizeMode}
                  repeat={this.state.repeat}
                  onLoadStart={this._onLoadStart}
                  onLoad={this._onLoad}
                  onProgress={this._onProgress}
                  onEnd={this._onEnd}
                  onError={this._onError}
                /> 
                {
                  !this.state.videoUploaded&&this.state.videoUploading
                  ?<View style={styles.progressTipBox}>
                    <ProgressViewIOS style={styles.progressBar} progressTintColor='#ee735c'
                    progress={this.state.videoUploadedProgress} />
                    <Text style={styles.progressTip}>正在生成静音视频，已完成{(this.state.videoUploadedProgress*100).toFixed(2)}%</Text>
                  </View>
                  :null
                }
              </View>
            </View>
            :<TouchableOpacity style={styles.uploadContainer} onPress={this._pickVideo}>
              <View style={styles.uploadBox}>
                <Image source={require('../assets/images/record.png')} style={styles.uploadIcon} />
                <Text style={styles.uploadTitle}>点我上传视频</Text>
                <Text style={styles.uploadDesc}>建议时长不超过20秒</Text>
              </View>  
            </TouchableOpacity>
          }
        </View>
        <View style={styles.toolbar}></View>
      </View>
    );
  },
  //选着视频
  _pickVideo(){
    var that=this;
    ImagePicker.showImagePicker(videoOptions, (res) => {
      //如果用户取消了操作
      if (res.didCancel) {
        return
      }
      var uri=res.uri
      that.setState({
        previeVideo:uri
      })
      that._getQiniuToken()
        .then((data)=>{
          if(data&&data.success){
            var token=data.data.token
            var key=data.data.key

            var body=new FormData()
            body.append('token',token)
            body.append('key',key)
            body.append('file',{
              type:'video/mp4',
              uri:uri,
              name:key
            })
            that._upload(body)
          }
        })
  
    });
  },
  //获取签名
  _getQiniuToken(){
    var accessToken=this.state.user.accessToken//拿到token
    var signatureUrl=config.api.base+config.api.signature//获取签名的地址
    return request.post(signatureUrl,{
      accessToken:accessToken,
      type:'video',
      cloud:'qiniu'
    })
      .catch((err)=>{
        console.log(err)
      })
  },
  //上传视频
  _upload(body){
    var that=this
    this.setState({
      videoUploadedProgress:0,
      videoUploading:true,//正在上传
      videoUploaded:false//
    })

    var xhr=new XMLHttpRequest()
    var url=config.qiniu.upload
    
    xhr.open('POST',url)
    //请求结束
    xhr.onload=()=>{
      if(xhr.status!==200){
        AlertIOS.alert('请求失败')
        console.log(xhr.responseText)
        return
      }
      //返回的空值或者
      if(!xhr.responseText){
        AlertIOS.alert('请求失败')
        return
      }
      var response
      try{
        response=JSON.parse(xhr.response)
      }
      catch(e){
        console.log('异常')
        console.log(e)
      }
      console.log(response)
      if(response&&response.key){
        that.setState({
          videoUploading:false,
          videoUploaded:true,
          video:response
        })
        var videoURL=config.api.base+config.api.video
        var accessToken=that.state.accessToken
        request.post(videoURL,{
          accessToken:accessToken,
          video:response
        })
        .catch((err)=>{
          console.log(err)
          AlertIOS.alert('视频同步出错，请重新上传！')
        })
        .then((data)=>{
          if(!data||!data.success){
            AlertIOS.alert('视频同步出错，请重新上传！')
          }
        })

      }
    }

    //上传状态
    if(xhr.upload){
      xhr.upload.onprogress=(event)=>{
        if(event.lengthComputable){
          var percent=Number((event.loaded/event.total).toFixed(2))
          console.log(percent)
          that.setState({
            videoUploadedProgress:percent
          })
        }
      }
    }
    //执行请求
    xhr.send(body)
  },


  //当视频开始加载那一刹那来调用
  _onLoadStart(){
    console.log('当视频开始加载那一刹那来调用')
  },

  //当视频在不断地加载 会不断地来触发
  _onLoad(){
    console.log('当视频在不断地加载 会不断地来触发')
  }, 

  //当视频在播放时的时候每隔250毫秒会来调用一下
  _onProgress(data){
    //console.log('当视频在播放时的时候每隔250毫秒会来调用一下')
  },


  //播放结束
  _onEnd(){
    this.setState({
      videoProgress:1,
      playing:false
    })
    console.log('播放结束')
  },

  //视频出错的时候
  _onError(e){
    this.setState({
      videoOk:false
    })
    console.log(e)
    console.log('视频出错的时候')
  },

  //开始播放按钮
  _resume(){
    if(this.state.paused){
      this.setState({
        paused:false
      })
    } 
  },






})


var styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar:{
    flexDirection:'row',
    paddingTop:25,
    paddingBottom:12,
    backgroundColor:'#ee735c'
  },
  toolbarTitle:{
    flex:1,
    fontSize:16,
    color:'#fff',
    textAlign:'center',
    fontWeight:'600'
  },
  toolbarExtra:{
    position:'absolute',
    right:10,
    top:26,
    color:'#fff',
    textAlign:'right',
    fontWeight:'600',
    fontSize:14
  },
  /*视频上传区域 s */
  page:{
    flex:1,
    alignItems:'center',
  },
  uploadContainer:{
    marginTop:90,
    width:width-40,
    height:200,
    paddingBottom:10,
    borderWidth:1,
    borderColor:'#ee735c',
    backgroundColor:'#fff',
    justifyContent:'center',
    borderRadius:6
  },
  uploadBox:{
    flex:1,
    alignItems:'center',
    justifyContent:'center',
    flexDirection:'column',
    //backgroundColor:'red'
  },
  uploadIcon:{
    width:190,
    resizeMode:'contain'
  },
  uploadTitle:{
    textAlign:'center',
    fontSize:16,
    marginBottom:10,
    color:'#000'
  },
  uploadDesc:{
    color:'#999',
    textAlign:'center',
    fontSize:12
  },

  videoContainer:{
    width:width,
    justifyContent:'center',
    alignItems:'flex-start'
  },
  videoBox:{
    width:width,
    height:height*0.6
  },
  video:{
    width:width,
    height:height*0.6,
    backgroundColor:'#333'
  },
  progressTipBox:{
    position:'absolute',
    left:0,
    bottom:0,
    width:width,
    height:30,
    backgroundColor:'rgba(244,244,244,0.65)'
  },
  progressBar:{
    width:width
  },
  progressTip:{
    color:'#333',
    width:width-10,
    padding:5
  },
  /*视频上传区域 e */
});

module.exports=Edit