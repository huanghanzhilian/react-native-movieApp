/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

//原生模块或者第三方模块
//import React, { Component } from 'react';
import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
//var Icon=require('react-native-vector-icons/Ionicons');
import NavigationExperimental from 'react-native-deprecated-custom-components';

//组件或者工具模块 就是本地项目模块
var List = require('./app/creation/index')
var Edit = require('./app/edit/index')
var Account = require('./app/account/index')
var Login = require('./app/account/login')


//利用上面的模块，导出他们的构造或者接口申明一些相关变量
import {
  TabBarIOS,
  AppRegistry,
  StyleSheet,
  Text,
  View,
  AsyncStorage
} from 'react-native';


//组件具体代码
var test5App =React.createClass({
  getInitialState: function() {
    return {
      selectedTab:'account',//list
      logined:false,//是否登录
      user:null,//用户信息
    };
  },

  //安装过  3
  componentDidMount(){
    this._asyncAppStatus()    
  },
  //异步读取本机存储
  _asyncAppStatus(){
    var that=this
    AsyncStorage.getItem('user')
      .then((data)=>{
        var user
        var newState={}

        if(data){
          //console.log(data)
          //转成json
          user=JSON.parse(data)
        }
        if(user&&user.accessToken){
          newState.user=user
          newState.logined=true
        }else{
          newState.logined=false
        }
        this.setState(newState)
      })
  },
  //登录之后存储用户信息
  _afterLondin(user){
    //将json转成字符串
    user=JSON.stringify(user)
    AsyncStorage.setItem('user',user)
      .then(()=>{
        this.setState({
          logined:true,
          user:user
        })
      })
  },
  //退出登录
  _logout(){
    AsyncStorage.removeItem('user')
    this.setState({
      logined:false,
      user:null
    })
  },

  render: function() {
    if(!this.state.logined){
      return <Login afterLondin={this._afterLondin} />
    }
    return (
      <TabBarIOS
        unselectedTintColor="#ccc"
        tintColor="white"
        barTintColor="darkslateblue">
        <Icon.TabBarItem
          title="列表页"
          iconName='ios-videocam-outline'
          selectedIconName='ios-videocam'
          selected={this.state.selectedTab === 'list'}
          onPress={() => {
            this.setState({
              selectedTab: 'list',
            });
          }}>
          <NavigationExperimental.Navigator
            initialRoute={{name: 'list',component:List}}
            configureScene={(route) =>{
              return NavigationExperimental.Navigator.SceneConfigs.FloatFromRight
            }} 
            renderScene={
              (route, navigator) =>{
                var Component=route.component
                return <Component {...route.params} navigator={navigator} />
              }
            }
          />
        </Icon.TabBarItem>
        <Icon.TabBarItem
          title="编辑页"
          iconName='ios-recording-outline'
          selectedIconName='ios-recording'
          selected={this.state.selectedTab === 'edit'}
          onPress={() => {
            this.setState({
              selectedTab: 'edit'
            });
          }}>
          <Edit />
        </Icon.TabBarItem>
        <Icon.TabBarItem
          title="我的"
          iconName='ios-more-outline'
          selectedIconName='ios-more'
          selected={this.state.selectedTab === 'account'}
          onPress={() => {
            this.setState({
              selectedTab: 'account'
            });
          }}>
          <Account user={this.user} logout={this._logout}/>
        </Icon.TabBarItem>
      </TabBarIOS>
    );
  },
})

var styles = StyleSheet.create({
  tabContent: {
    flex: 1,
    alignItems: 'center',
  },
  tabText: {
    color: 'white',
    margin: 50,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('test5App', () => test5App);
