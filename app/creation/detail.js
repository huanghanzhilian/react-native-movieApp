import React, { Component } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
//var Icon=require('react-native-vector-icons/Ionicons');
//var Video=require('react-native-video').default;//default默认导出
import  Video from 'react-native-video'
import  Button from 'react-native-button'


//组件或者工具模块 就是本地项目模块
var request=require('../common/request')
var config=require('../common/config');

import {
  TabBarIOS,
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  ScrollView,
  ListView,
  TextInput,
  Modal,
  AlertIOS
} from 'react-native';

var width=Dimensions.get('window').width//获取屏幕宽度
var cachedResults={
  nextPage:1,
  items:[],
  total:0
}


var Detail =React.createClass({
  //初始状态时，通过属性状态
  getInitialState: function() {
    var data=this.props.data
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    return {
      data:data,

      //video标签参数
      rate:1,
      muted:false,
      resizeMode:'contain',
      repeat:false,

      playing:false,//播放结束
      videoLoaded:false,//视频加载中动画  加载完毕
      videoProgress:0.01,//进度条
      videoTotal:0,//视频整个时间
      currentTime:0,//当前时间
      paused:false,//是否暂停
      videoOk:true,//视频是否出错

      dataSource:ds.cloneWithRows([]),//评论初始的列表状态
      isLoadingTail:false,

      //modal
      modalVisible:false,//是否打开浮层
      isSending:false,//是否正在提交评论  
      content:'',//默认评论值
    }
  },

  //返回上一页
  _pop(){
    this.props.navigator.pop()
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

  //重新播放视频
  _rePlay(){
    console.log(this)
    this.refs.videoPlayer.seek(0)
  },
  //暂停
  _pause(){
    if(!this.state.paused){
      this.setState({
        paused:true
      })
    }  
  },
  //开始播放按钮
  _resume(){
    if(this.state.paused){
      this.setState({
        paused:false
      })
    } 
  },
  //获取评论数据
  _fetchData:function(page){
    var that=this
    if(page!==0){
      this.setState({
        isLoadingTail:true
      })
    }else{
      this.setState({
        isRefreshing:true
      })
    }
      
    request.get(config.api.base+config.api.comment,{
      _id:124,
      accessToken:'abcd',
      page:page
    })
    .then((data) => {
      if(data.success){
        var items=cachedResults.items.slice()
        

        if(page!==0){
          items=[...items,...data.data]
          cachedResults.nextPage+=1
        }else{
          items=[...items,...data.data]
        }
        cachedResults.items=items
        cachedResults.total=data.total
        
        setTimeout(()=>{
          if(page!==0){
            this.setState({
              isLoadingTail:false,
              dataSource:this.state.dataSource.cloneWithRows(cachedResults.items)
            })
          }else{
            this.setState({
              isRefreshing:false,
              dataSource:this.state.dataSource.cloneWithRows(cachedResults.items)
            })
          }
        },3000)
          
      }
    })
    .catch((error) => {
      if(page!==0){
        this.setState({
          isLoadingTail:false,
        })
      }else{
        this.setState({
          isRefreshing:false,
        })
      }
      console.error(error);
    });
  },
  _hasMore(){
    return cachedResults.items.length!==cachedResults.total 
  },
  //获取更多数据
  _fechMoreData(){
    //如果有更多数据了或者是在加载中 直接返回
    if(!this._hasMore()||this.state.isLoadingTail){
      return
    }
    var page= cachedResults.nextPage
    this._fetchData(page)
  },

  _renderFooter(){
    if(!this._hasMore()&&cachedResults.total!==0){
      return (
        <View style={styles.loadingMore}><Text style={styles.loadingText}>没有更多了</Text>
        </View>
      )
    }
    if(this.state.isLoadingTail){
      return (
        <View style={styles.loadingMore}>
          <Text style={styles.loadingText}>拼命加载中...</Text>
          <ActivityIndicator style={styles.loadingMore} />
        </View>
      )
    }

    //return <ActivityIndicator style={styles.loadingMore} />
  },

  //ListView渲染
  _renderRow:function(row){

    return (
      <View key={row._id} style={styles.replyBox}>
        <Image style={styles.replyAvatar} source={{uri: row.replyBy.avatar}} />
        <View style={styles.reply}>
          <Text style={styles.replyNickname}>{row.replyBy.nickname}</Text>
          <Text style={styles.replyComment}>{row.content}</Text>
        </View>
      </View>
    )
  },

  render: function() {
    var data=this.props.data
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.popBox} onPress={this._pop}>
            <Icon style={styles.backIcon} name="ios-arrow-back" />
            <Text style={styles.backText}>返回</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOflines={1}>视频详情页</Text>
        </View>

        <View style={styles.videoBox}>
          <Video
            ref='videoPlayer'
            source={{uri: data.video}}
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
            !this.state.videoLoaded&&<ActivityIndicator color='#ee735c' style={styles.loading} />
          }

          {
            this.state.videoLoaded&&!this.state.playing
            ?<Icon
              onPress={this._rePlay}
              name='ios-play'
              style={styles.playIcon}
              size={48}
            />
            :null
          }

          {
            this.state.videoLoaded&&this.state.playing
            ?<TouchableOpacity onPress={this._pause} style={styles.pauseBtn}>
              {
                this.state.paused
                ?<Icon
                  onPress={this._resume}
                  name='ios-play'
                  style={styles.resumeIcon}
                  size={48}
                />
                :<Text></Text>
              }
            </TouchableOpacity>
            :null
          }

          {
            !this.state.videoOk&&<Text style={styles.failText}>视频出错了！很抱歉</Text>
          }

          <View style={styles.progressBox}>
            <View style={[styles.progressBar,{width:width*this.state.videoProgress}]}></View>
          </View>
        </View>
          <ListView
            dataSource={this.state.dataSource}
            renderRow={this._renderRow}
            enableEmptySections={true}
            automaticallyAdjustContentInsets={false}
            showsVerticalScrollIndicator={false}
            renderHeader={this._renderHeader}
            onEndReached={this._fechMoreData}
            onEndReachedThreshold={20}
            renderFooter={this._renderFooter}
          />
          <Modal
            animationType={'fade'}//定义浮层出现形式
            visible={this.state.modalVisible}//是否开启
            onRequsetClose={()=>{this._setModalVisible(false)}}//关闭时候
            >
            <View style={styles.modalContainer}>
              <Icon
                onPress={this._closeModal}
                name='ios-close-outline'
                style={styles.closeIcon}
               />
              <View style={styles.commentBox}>
                <TextInput 
                  style={styles.content} 
                  placeholder='敢不敢评论一个...'
                  multiline={true}//多行
                  onFocus={this._focus}//聚焦
                  onBlur={this._blur}
                  defaultValue={this.state.content}//初始值
                  onChangeText={(text)=>{
                    this.setState({
                      content:text
                    })
                  }}//输入文案触发
                />
              </View>
              <Button style={styles.submitBtn} onPress={this._submit}>
                评论
              </Button>
            </View>
          </Modal>
      </View>
    );
  },
  _renderHeader(){
    var data=this.state.data
    return (
      <View style={styles.listHeader}>
        <View style={styles.infoBox}>
          <Image style={styles.avatar} source={{uri: data.author.avatar}} />
          <View style={styles.descBox}>
            <Text style={styles.nickname}>{data.author.nickname}</Text>
            <Text style={styles.title}>{data.title}</Text>
          </View>
        </View>
        <View style={styles.commentBox}>
          <TextInput 
            style={styles.content} 
            placeholder='敢不敢评论一个...'
            multiline={true}//多行
            onFocus={this._focus}
          />
        </View>
        <View style={styles.commentArea}>
          <Text style={styles.commentTitle}>精彩评论</Text>
        </View>
      </View>
        
    )
  },
  //输入框聚焦
  _focus(){
    this._setModalVisible(true)
  },
  //
  _setModalVisible(islVisible){
    this.setState({
      modalVisible:islVisible
    })
  },
  _closeModal(){
    this._setModalVisible(false)
  },
  _blur(){

  },
  //评论提交
  _submit(){
    if(!this.state.content){
      return AlertIOS.alert('留言不能为空！')
    }
    if(this.state.isSending){
      return AlertIOS.alert('正在评论中！')
    }
    this.setState({
      isSending:true
    },function(){
      var body={
        accessToken:'abc',
        comment:'123',
        content:this.state.content
      }
      var url=config.api.base+config.api.comment;

      request.post(url,body)
        .then((data)=>{
          //return
          //console.log(cachedResults.items.slice())
          if(data&&data.success){
            var items=cachedResults.items.slice()
            var content=this.state.content
            
            items=[...[{
              content:content,
              replyBy:{
                avatar:'http://static.samured.com/assets/images/game/head/44663f7d04d0b59ab162c51700494646.png',
                nickname:'黄继鹏'
              }
            }],...items]    
            console.log(items)   

            cachedResults.items=items
            cachedResults.total=cachedResults.total+1
            console.log(cachedResults)
            this.setState({
              content:'',
              isSending:false,
              dataSource:this.state.dataSource.cloneWithRows(items)
            },()=>{
              setTimeout(()=>{
                console.log(this.state)
                this._setModalVisible(false)
              },100)
            })
            
            // //console.log(this)
            
          }
        })
        .catch((error) => {
          this.setState({
            content:'',
            isSending:false,
          })
          this._setModalVisible(false)
          AlertIOS.alert('留言失败，骚猴重试！')
        })
    })
  },
  //安装过  3
  componentDidMount(){
    this._fetchData(1)
  },
})


var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  videoBox:{
    width:width,
    height:width*0.56,
    backgroundColor:'#000'
  },
  video:{
    width:width,
    height:width*0.56,
    backgroundColor:'#000'
  },
  loading:{
    position:'absolute',
    left:0,
    top:80,
    width:width,
    alignSelf:'center',
    backgroundColor:'transparent'
  },
  progressBox:{
    width:width,
    height:10,
    backgroundColor:'#ccc',
  },
  progressBar:{
    width:1,
    height:10,
    backgroundColor:'#ff6600'
  },
  playIcon:{
    position:'absolute',
    top:90,
    left:width/2-30,
    width:60,
    height:60,
    paddingTop:8,
    paddingLeft:22,
    backgroundColor:'transparent',
    borderColor:'#fff',
    borderWidth:1,
    borderRadius:30,
    color:'#ed7b66'
  },
  pauseBtn:{
    width:width,
    height:width*0.56,
    position:'absolute',
    top:0,
    left:0,
  },
  resumeIcon:{
    position:'absolute',
    top:80,
    left:width/2-30,
    width:60,
    height:60,
    paddingTop:8,
    paddingLeft:22,
    backgroundColor:'transparent',
    borderColor:'#fff',
    borderWidth:1,
    borderRadius:30,
    color:'#ed7b66'
  },
  failText:{
    position:'absolute',
    left:0,
    top:90,
    width:width,
    textAlign:'center',
    color:'#fff',
    backgroundColor:'transparent'
  },
  header:{
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center',
    width:width,
    height:64,
    paddingTop:20,
    paddingLeft:10,
    paddingRight:10,
    borderBottomWidth:1,
    borderBottomColor:'rgba(0,0,0,0.1)',
    backgroundColor:'#fff'
  },
  popBox:{
    position:'absolute',
    left:12,
    top:32,
    width:50,
    flexDirection:'row',
    alignItems:'center'
  },
  backIcon:{
    color:'#999',
    fontSize:20,
    marginRight:5
  },
  backText:{
    color:'#999'
  },
  headerTitle:{
    width:width-120,
    textAlign:'center'
  },

  infoBox:{
    width:width,
    flexDirection:'row',
    justifyContent:'center',
    marginTop:20,
  },
  avatar:{
    width:60,
    height:60,
    marginRight:10,
    marginLeft:10,
    borderRadius:30
  },
  descBox:{
    flex:1,
  },
  nickname:{
    fontSize:18
  },
  title:{
    marginTop:8,
    fontSize:16,
    color:'#666'
  },
  replyBox:{
    flexDirection:'row',
    justifyContent:'flex-start',
    marginTop:10,
  },
  replyAvatar:{
    width:40,
    height:40,
    marginRight:10,
    marginLeft:10,
    borderRadius:20
  },
  reply:{
    flex:1
  },
  replyNickname:{
    color:'#666'
  },
  replyComment:{
    color:'#666',
    marginTop:4
  },
  loadingText:{
    color:'#777',
    textAlign:'center'
  },
  loadingMore:{
    marginVertical:20
  },
  listHeader:{
    marginTop:10,
    width:width
  },
  commentBox:{
    marginTop:10,
    marginBottom:10,
    padding:8,
    width:width,
  },
  content:{
    paddingLeft:2,
    color:'#333',
    borderWidth:1,
    borderColor:'#ddd',
    borderRadius:4,
    fontSize:14,
    height:80
  },
  commentArea:{
    width:width,
    marginTop:1,
    paddingBottom:6,
    paddingLeft:10,
    paddingRight:10,
    borderBottomWidth:1,
    borderBottomColor:'#eee'
  },
  commentTitle:{

  },


  modalContainer:{
    flex:1,
    paddingTop:45,
    borderBottomColor:'#fff',
  },
  closeIcon:{
    alignSelf:'center',
    fontSize:30,
    color:'#ee753c'
  },
  submitBtn:{
    width:width-20,
    padding:16,
    marginTop:20,
    marginBottom:20,
    borderWidth:1,
    borderColor:'#ee753c',
    borderRadius:4,
    color:'#ee753c',
    fontSize:18
  }
});

module.exports=Detail










