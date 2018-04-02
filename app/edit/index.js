import React, { Component } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import  Video from 'react-native-video'
var CountDownText= require('../common/CountDownText')
import * as ImagePicker from 'react-native-image-picker';
import {AudioRecorder, AudioUtils} from 'react-native-audio'
import Sound from 'react-native-sound';
var Progress=require('react-native-progress')
var _=require('lodash')


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
  ProgressViewIOS,
  Platform
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
var defaultState={
  videoId:null,
  audioId:null,

  previeVideo:null,//是否选择视频

  //video标签参数
  rate:1,
  muted:true,//是否静音
  resizeMode:'contain',
  repeat:false,
  paused:false,//是否暂停


  //视频播放相关
  videoProgress:0.01,//进度条
  videoTotal:0,//视频整个时间
  currentTime:0,//当前时间



  //视频上传参数
  video:null,
  videoUploading:false,//是否正在上传中
  videoUploaded:false,//是否上传成功
  videoUploadedProgress:0,//视频上传进度


  //count down
  counting:false,//是否进入正在计数
  recording:false,//是否正在录音


  //audio
  audio:null,
  audioName:AudioUtils.DocumentDirectoryPath + '/gougou.aac',
  audioPlaying:false,//是否正在播放中
  recordDone:false,//录音是否完成

  audioUploading:false,//音频是否正在上传中
  audioUploaded:false,//音频是否上传成功
  audioUploadedProgress:0.13,//音频上传进度
}
var Edit =React.createClass({
  //初始状态时，通过属性状态
  getInitialState: function() {
    var user=this.props.user||{}
    var state=_.clone(defaultState)
    state.user=user
    return state
  },
  prepareRecordingPath(audioPath){
    AudioRecorder.prepareRecordingAtPath(audioPath, {
      SampleRate: 22050,
      Channels: 1,
      AudioQuality: "Low",
      AudioEncoding: "aac",
      AudioEncodingBitRate: 32000
    });
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

    //对音频进行初始化
    this._initAudio()
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
                {
                  //如果正在录音 或者正在播放中显示进度条
                  this.state.recording||this.state.audioPlaying
                  ?<View style={styles.progressTipBox}>
                    <ProgressViewIOS style={styles.progressBar} progressTintColor='#ee735c'
                    progress={this.state.videoProgress} />
                    {
                      this.state.recording
                      ?<Text style={styles.progressTip}>录制声音中</Text>
                      :null
                    }
                  </View>
                  :null
                }
                {
                  //录音完成后 可播放区域
                  //recordDone 录制结束
                  this.state.recordDone
                  ?<View style={styles.previewBox}>
                    <Icon
                      name='ios-play'
                      style={styles.previewIcon}
                      size={48}
                      onPress={this._preview}
                    />
                    <Text style={styles.previewText} onPress={this._preview}>预览</Text>
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


          {
            this.state.videoUploaded
            ?<View style={styles.recordBox}>
              <View style={[styles.recordIconBox,(this.state.recording ||this.state.audioPlaying)&&styles.recordOn]}>
                {
                  this.state.counting&&!this.state.recording
                  ?<CountDownText
                    style={styles.countBtn}
                    countType='seconds' // 计时类型：seconds / date
                    auto={true} // 自动开始
                    afterEnd={this._record} // 结束回调
                    timeLeft={2} // 正向计时 时间起点为0秒
                    step={-1} // 计时步长，以秒为单位，正数则为正计时，负数为倒计时
                    startText='准备录制' // 开始的文本
                    endText='Go' // 结束的文本
                    intervalText={(sec) => { 
                      return sec===0?'Go':sec
                    }} // 定时的文本回调
                  />
                  :<TouchableOpacity onPress={this._counting}>
                    <Icon name='ios-mic' style={styles.recordIcon} />
                  </TouchableOpacity>
                }
                  
                  
              </View>
            </View>
            :null
          }
            
          {
            //视频上传结束同时录音结束
            this.state.videoUploaded&&this.state.recordDone
            ?<View style={styles.uploadAudioBox}>
              {
                //当音频正在上传中或者音频已经上传结束
                !this.state.audioUploaded&&!this.state.audioUploading
                ?<Text style={styles.uploadAudioText} onPress={this._uploadAudio}>下一步</Text>
                :null
              }
              {
                //音频上传
                this.state.audioUploading
                ?<Progress.Circle 
                  showsText={true}
                  color={'#ee735c'}
                  progress={this.state.audioUploadedProgress}
                  size={60} />
                :null
              }
            </View>
            :null
          }
        </View>
        <View style={styles.toolbar}></View>
      </View>
    );
  },
  //对音频进行初始化
  _initAudio(){    
    this.prepareRecordingPath(this.state.audioName);
    
    AudioRecorder.onProgress = (data) => {
      this.setState({currentTime: Math.floor(data.currentTime)});
    };
    AudioRecorder.onFinished = (data) => {
      this.setState({finished: data.finished});
      console.log(`Finished recording: ${data.finished}`);
    };
  },
  //录制音频播放
  _preview(){
    console.log('播放音频视频')
    //播放音频 
    setTimeout(() => {
      var sound = new Sound(this.state.audioName, '', (error) => {
        if (error) {
          console.log('failed to load the sound', error);
        }
      });
      console.log(this.state.audioName)


      setTimeout(() => {
        if(this.state.audioPlaying){
          //音频不再播放
          sound.stop((success) => {
            if (success) {
              console.log('停止播放音频');
            } else {
              console.log('停止播放音频失败');
            }
          });
        }
        
        this.setState({
          videoProgress:0,
          audioPlaying:true
        })
        this.refs.videoPlayer.seek(0)//将视频从头开始播放
        sound.play((success) => {
          if (success) {
            console.log('播放音频成功');
          } else {
            console.log('播放音频失败');
          }
        });
      }, 100);
    }, 100);

    
  },
  //倒计时结束  开始录音
  _record(){
    this.setState({
      videoProgress:0,
      counting:false,
      recording:true,
      recordDone:false,
      paused:false
    })

    const filePath = AudioRecorder.startRecording();    
    // AudioRecorder.startRecording()//开启录音
    //通过refs来引用到某一个组件
    this.refs.videoPlayer.seek(0)//将视频从头开始播放
  },
  //启动倒计时  启动录音
  _counting(){
    //没有进入倒计时和没有录音 将开始倒计时
    if(!this.state.counting&&!this.state.recording&&!this.state.audioPlaying){
      this.setState({
        counting:true
      })
      //this.refs.videoPlayer.seek(this.state.videoTotal-0.01)//将视频进度调整到最后几毫秒
    } 
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
    var duration=data.seekableDuration;
    var currentTime=data.currentTime;
    var precent=Number((currentTime/duration).toFixed(2));//比例
    
    var newState={
      videoTotal:duration,
      currentTime:Number(data.currentTime.toFixed(2)),
      videoProgress:precent
    }
    //this.setState(newState)

    //console.log(data)
    //paused
    if(this.state.recording){
      this.setState(newState)
    }
    //this.setState(newState)
    //console.log('当视频在播放时的时候每隔250毫秒会来调用一下')
  },


  //播放结束
  _onEnd(){
    //如果正在录音的结束
    if(this.state.recording){
      //AudioRecorder.stopRecording()//结束录音
      //const filePath =  AudioRecorder.stopRecording();
      ///console.log()
      this.setState({
        videoProgress:1,
        recording:false,
        recordDone:true,
      })
    }
    this.setState({
      audioPlaying:false,
    })
    console.log('播放结束11')
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


  //上传音频
  _uploadAudio(){
    var that=this
    var tags='app,audio'
    var folder='audio'
    var timestamp=Date.now()
    that._getToken({
      type:'audio',
      timestamp:timestamp,
      cloud:'cloudinary'
    })
    .catch((err)=>{
      AlertIOS.alert('请求签名错误')
    })
    .then((data)=>{
      console.log(data)
      if(data&&data.success){
        var signature=data.data.token
        var key=data.data.key
        var body=new FormData()

        body.append('folder',folder)
        body.append('signature',signature)
        body.append('tags',tags)
        body.append('timestamp',timestamp)
        body.append('api_key',config.cloudinary.api_key)
        body.append('resource_type','video')
        body.append('file',{
          type:'video/mp4',
          uri:that.state.audioName,
          name:key
        })

        that._upload(body,'audio')
      }
    })




  },

  //选着视频
  _pickVideo(){
    var that=this;
    ImagePicker.showImagePicker(videoOptions, (res) => {
      //如果用户取消了操作
      if (res.didCancel) {
        return
      }
      var state=_.clone(defaultState)
      state.previeVideo=res.uri
      state.user=this.state.user
      var uri=res.uri
      that.setState(state)
      that._getToken({
        type:'video',
        cloud:'qiniu'
      })
        .catch((err)=>{
          AlertIOS.alert('上传出错！')
          console.log(err)
        })
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
            that._upload(body,'video')
          }
        })
  
    });
  },
  //获取七牛或国外图床签名
  _getToken(body){
    var signatureUrl=config.api.base+config.api.signature//获取签名的地址

    body.accessToken=this.state.user.accessToken//拿到token

    return request.post(signatureUrl,body)
  },
  //上传视频 或音频
  _upload(body,type){
    var that=this
    var xhr=new XMLHttpRequest()
    var url=config.qiniu.upload

    if(type=='audio'){
      url=config.cloudinary.video
    } 

    var state={}
    state[type+'UploadedProgress']=0 //上传进度
    state[type+'Uploading']=true //正在上传
    state[type+'Uploaded']=false //上传成功

    this.setState(state)
    
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
      if(response){
        var newState={}
        newState[type]=response
        newState[type+'Uploading']=false
        newState[type+'Uploaded']=true

        that.setState(newState)


          var updateURL=config.api.base+config.api[type]
          var accessToken=that.state.user.accessToken
          var updateBody={
            accessToken:accessToken
          }

          updateBody[type]=response

          if(type==='audio'){
            updateBody.videoId=that.state.videoId
          }

          request.post(updateURL,updateBody)
          .catch((err)=>{
            console.log(err)
            if(type==='video'){
              AlertIOS.alert('视频同步出错，请重新上传！')
            }else if(type==='audio'){
              AlertIOS.alert('音频同步出错，请重新上传！')
            }
            
          })
          .then((data)=>{
            console.log(data)
            if(data&&data.success){
              var mediaState={}
              mediaState[type+'Id']=data.data
              that.setState(mediaState)
            }else{
              if(type==='video'){
                AlertIOS.alert('视频同步出错，请重新上传！')
              }else if(type==='audio'){
                AlertIOS.alert('音频同步出错，请重新上传！')
              }
            }
          })



    
      }
    }

    //上传状态
    if(xhr.upload){
      xhr.upload.onprogress=(event)=>{
        if(event.lengthComputable){
          var percent=Number((event.loaded/event.total).toFixed(2))
          var progressState={}
          progressState[type+'UploadedProgress']=percent
          that.setState(progressState)
        }
      }
    }
    //执行请求
    xhr.send(body)
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
  /*录音环节s*/
  recordBox:{
    width:width,
    height:60,
    alignItems:'center'
  },
  recordIconBox:{
    width:68,
    height:68,
    marginTop:-30,
    borderRadius:34,
    backgroundColor:'#ee735c',
    borderWidth:1,
    borderColor:'#fff',
    alignItems:'center',
    justifyContent:'center',
  },
  countBtn:{
    fontSize:32,
    fontWeight:'600',
    color:'#fff'
  },
  recordIcon:{
    fontSize:58,
    backgroundColor:'transparent',
    color:'#fff'
  },
  recordOn:{
    backgroundColor:'#ccc'
  },
  /*录音环节e*/
  /*录制完音频预览区域 s */
  previewBox:{
    width:80,
    height:30,
    position:'absolute',
    right:10,
    bottom:10,
    borderColor:'#ee735c',
    borderWidth:1,
    borderRadius:3,
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center'
  },
  previewIcon:{
    marginRight:5,
    fontSize:20,
    color:'#ee735c',
    backgroundColor:'transparent'
  },
  previewText:{
    fontSize:20,
    color:'#ee735c',
    backgroundColor:'transparent'
  },
  /*录制完音频预览区域 e */
  /*上传音频按钮*/
  uploadAudioBox:{
    width:width,
    height:60,
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center'
  },
  uploadAudioText:{
    width:width-20,
    borderWidth:1,
    borderColor:'#ee735c',
    borderRadius:5,
    padding:5,
    textAlign:'center',
    fontSize:30,
    color:'#ee735c'
  },
  /*上传音频按钮*/
});

module.exports=Edit