import React, { Component } from 'react';
var Icon=require('react-native-vector-icons/Ionicons');
import  Video from 'react-native-video'
import * as ImagePicker from 'react-native-image-picker';


import {
  TabBarIOS,
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Dimensions
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
    //var user=this.props.user||{}
    return {
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
      videoOk:true,//视频是否出错


    }
  },
  render: function() {
    return (
      <View style={styles.container}>
        <View style={styles.toolbar}>
          <Text style={styles.toolbarTitle}>
            {this.state.previeVideo?'点击按钮配音':'理解狗狗从配音开始'}
          </Text>
          <Text onPress={this._pickVideo} style={styles.toolbarExtra}>更换视频</Text>
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
      // that._getQiniuToken()
      //   .then((data)=>{
      //     console.log(data)
      //     if(data&&data.success){
      //       var token=data.data.token
      //       var key=data.data.key

      //       var body=new FormData()
      //       body.append('token',token)
      //       body.append('key',key)
      //       body.append('file',{
      //         type:'image/png',
      //         uri:uri,
      //         name:key
      //       })
      //       that._upload(body)
      //     }
      //   })
  
    });
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
    if(!this.state.videoLoaded){
      this.setState({
        videoLoaded:true
      })
    }

    var duration=data.seekableDuration;
    var currentTime=data.currentTime;
    var precent=Number((currentTime/duration).toFixed(2));//比例
    
    var newState={
      videoTotal:duration,
      currentTime:Number(data.currentTime.toFixed(2)),
      videoProgress:precent
    }

    if(!this.state.videoLoaded){
      newState.videoLoaded=true
    }
    if(!this.state.playing){
      newState.playing=true
    }

    this.setState(newState)

    console.log(data)
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
  }
  /*视频上传区域 e */
});

module.exports=Edit