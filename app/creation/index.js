
//原生模块或者第三方模块
import React, { Component } from 'react';
//var Icon = require('react-native-vector-icons/Ionicons');

import Icon from 'react-native-vector-icons/Ionicons';
//组件或者工具模块 就是本地项目模块
var request=require('../common/request')
var config=require('../common/config');
var Detail = require('./detail')


import {
  TabBarIOS,
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Image,
  ListView,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  AlertIOS
} from 'react-native';

var width=Dimensions.get('window').width//获取屏幕宽度

var cachedResults={
  nextPage:1,
  items:[],
  total:0
}

//子组件
var Item =React.createClass({
  //初始状态时，通过属性状态获取row
  getInitialState: function() {
    //拿到row
    var row=this.props.row
    return {
      up:row.voted,//是否赞过
      row:row
    }
  },
  render(){
    var row=this.state.row
    return (
      <TouchableHighlight onPress={this.props.onSelect}>
        <View style={styles.item}>
          <Text style={styles.title}>{row.title}</Text>
          <Image 
            source={{uri: row.thumb}}
            style={styles.thumb}
          >
            <Icon name='ios-play' size={28} style={styles.play} />
          </Image>
          <View style={styles.itemFooter}>
            <View style={styles.handleBox}>
              <Icon
                name={this.state.up?'ios-heart':'ios-heart-outline'}
                size={28}
                style={[styles.up,this.state.up?null:styles.down]}
                onPress={this._up}
              />
              <Text style={styles.handleText} onPress={this._up}>喜欢</Text>
            </View>
            <View style={styles.handleBox}>
              <Icon
                name='ios-chatboxes-outline'
                size={28}
                style={styles.commentIcon}
              />
              <Text style={styles.handleText}>评论</Text>
            </View>
          </View>
        </View>
      </TouchableHighlight>
    )
  },
  //点赞方法
  _up(){
    var that=this
    //拿到当前点赞状态 的取反
    var up=!this.state.up
    //拿到当前row数据
    var row=this.state.row
    //构建请求的url
    var url =config.api.base+config.api.up

    //构建post form表单的数据
    var body={
      id:row._id,
      up:up?'yes':'no',
      accessToken:'abcd'
    }

    request.post(url,body)
      .then(function(data){
        if(data&&data.success){
          that.setState({
            up:up
          })
        }
        else{
          AlertIOS.alert('点赞失败，稍后重试')
        }
      })
      //错误捕获
      .catch(function(err){
        console.log(err)
        AlertIOS.alert('点赞失败，稍后重试')
      })

  }
})

var List =React.createClass({
  getInitialState: function() {
    var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    return {
      isLoadingTail:false,
      isRefreshing:false,
      dataSource:ds.cloneWithRows([])
    }
  },

  //ListView渲染
  _renderRow:function(row){
    return <Item 
      key={row._id} 
      onSelect={()=>this._loadPage(row)} 
      row={row} />
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

  _onRefresh(){
    this._fetchData(0)
  },

  _renderFooter(){
    if(!this._hasMore()&&cachedResults.total!==0){
      return (
        <View style={styles.loadingMore}><Text style={styles.loadingText}>没有更多了</Text></View>
      )
    }
    if(this.state.isLoadingTail){
      return <View style={styles.loadingMore} />
    }

    return <ActivityIndicator style={styles.loadingMore} />
  },

  //开始安装  1
  componentWillMount(){
    console.log('开始安装')
  },
  //安装过  3
  componentDidMount(){
    console.log('安装完毕11',request)
    this._fetchData(1)
  },
  //获取数据
  _fetchData:function(page){
    this.setState({
      isLoadingTail:true
    })
    request.get(config.api.base+config.api.creations,{accessToken:'abcd',page:page})
    .then((data) => {
      console.log(data)
      if(data.success){
        console.log(data)
        var items=cachedResults.items.slice()
        //var items=[4,5]
        //console.log(data.data)
        items=[...items,...data.data]
        console.log(items)
        cachedResults.items=items

        cachedResults.total=data.total
        //console.log(cachedResults)
        this.setState({
          isLoadingTail:false,
          dataSource:this.state.dataSource.cloneWithRows(cachedResults.items)
        })
      }
    })
    .catch((error) => {
      this.setState({
        isLoadingTail:false
      })
      console.error(error);
    });
  },
  //item点击 打开详情页
  _loadPage(row){
    this.props.navigator.push({
      name:'detail',
      component:Detail,
      params:{
        data:row
      }
    })
  },
  render: function() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>列表页面</Text>
        </View> 
        <ListView
          dataSource={this.state.dataSource}
          renderRow={this._renderRow}
          onEndReached={this._fechMoreData}
          onEndReachedThreshold={20}
          renderFooter={this._renderFooter}
          enableEmptySections={true}
          automaticallyAdjustContentInsets={false}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={this.state.isRefreshing}
              onRefresh={this._onRefresh}
              tintColor="#ff6600"
              title="拼命加载中..."
            />
          }
        />
      </View>
    )
  }
})


var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  header:{
    paddingTop:25,
    paddingBottom:12,
    backgroundColor:'#ee735c'
  },
  headerTitle:{
    color:'#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight:'600'
  },
  item:{
    width:width,
    marginBottom:10,
    backgroundColor:'#fff'
  },
  title:{
    padding:10,
    fontSize:18,
    color:'#333'
  },
  thumb:{
    width:width,
    height:width*0.56,
    resizeMode:'cover',
    backgroundColor:'#000'
  },
  itemFooter:{
    flexDirection:'row',
    justifyContent:'space-between',
    backgroundColor:'#eee'
  },
  handleBox:{
    padding:10,
    flexDirection:'row',
    width:width/2-0.5,
    justifyContent:'center',
    backgroundColor:'#fff'
  },
  play:{
    position:'absolute',
    bottom:14,
    right:14,
    width:46,
    height:46,
    paddingTop:9,
    paddingLeft:18,
    backgroundColor:'transparent',
    borderColor:'#fff',
    borderWidth:1,
    borderRadius:23,
    color:'#ed7b66'
  },
  up:{
    fontSize:22,
    color:'#ed7b66'
  },
  down:{
    fontSize:22,
    color:'#333'
  },
  handleText:{
    paddingLeft:12,
    fontSize:18,
    color:'#333'
  },
  commentIcon:{
    fontSize:22,
    color:'#333'
  },
  loadingText:{
    color:'#777',
    textAlign:'center'
  },
  loadingMore:{
    marginVertical:20
  }
});

module.exports=List