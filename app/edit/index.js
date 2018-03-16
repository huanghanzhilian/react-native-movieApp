import React, { Component } from 'react';
var Icon=require('react-native-vector-icons/Ionicons');
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


var Edit =React.createClass({
  //初始状态时，通过属性状态
  getInitialState: function() {
    //var user=this.props.user||{}
    return {
      previeVideo:null,//是否选择视频
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
            ?<View></View>
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
  }
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
    backgroundColor:'#ccc'
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

  },
  uploadIcon:{
    width:110,
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
  /*视频上传区域 e */
});

module.exports=Edit