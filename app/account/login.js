import React, { Component } from 'react';
//var Icon=require('react-native-vector-icons/Ionicons');
import  Button from 'react-native-button'
var CountDownText= require('../common/CountDownText')
import Icon from 'react-native-vector-icons/Ionicons';

//组件或者工具模块 就是本地项目模块
var request=require('../common/request')
var config=require('../common/config');


import slwwsp,{
  TabBarIOS,
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TextInput,
  AlertIOS
} from 'react-native';

var Login =React.createClass({
  //初始状态时，通过属性状态
  getInitialState: function() {
      return {
      phoneNumber:'',//用户手机号
      verifyCode:'',//验证码
      codeSent:false,//是否已发送验证码
      countingDone:false,//是否计数
    }
  },
  render: function() {

    return (
      <View style={styles.container}>
        <View style={styles.signupBox}>
          <Text style={styles.title}>快速登录</Text>
          <TextInput 
            placeholder='输入手机号'
            autoCaptialize={'none'}//不去纠正大小写
            autoCorrect={false}//不去纠正内容对与错
            keyboradType={'number-pad'}//键盘配置
            style={styles.inputField}
            onChangeText={(text)=>{
              this.setState({
                phoneNumber:text
              })
            }}
          />
          {
            this.state.codeSent
            ?<View style={styles.verifyCodeBox}>
              <TextInput 
                placeholder='输入验证码'
                autoCaptialize={'none'}//不去纠正大小写
                autoCorrect={false}//不去纠正内容对与错
                keyboardType={'number-pad'}//键盘配置
                style={styles.inputField2}
                onChangeText={(text)=>{
                  this.setState({
                    verifyCode:text
                  })
                }}
              />
              
              {
                this.state.countingDone
                ?<Button
                    style={styles.countBtn}
                    onPress={this._sendVerifyCode}>获取验证码</Button>
                :<CountDownText
                  style={styles.countBtn}
                  countType='seconds' // 计时类型：seconds / date
                  auto={true} // 自动开始
                  afterEnd={this._countingDone} // 结束回调
                  timeLeft={60} // 正向计时 时间起点为0秒
                  step={-1} // 计时步长，以秒为单位，正数则为正计时，负数为倒计时
                  startText='获取验证码' // 开始的文本
                  endText='获取验证码' // 结束的文本
                  intervalText={(sec) => sec + '秒重新获取'} // 定时的文本回调
                />
              }
            </View>
            :null
          }
          {
            this.state.codeSent
            ?<Button
              style={styles.btn}
              onPress={this._submit}
            >登录</Button>
            :<Button
              style={styles.btn}
              onPress={this._sendVerifyCode}
            >获取验证码</Button>
          }
          
        </View>
      </View>
    );
  },
  //获取验证码按钮
  _sendVerifyCode(){
    var phoneNumber=this.state.phoneNumber
    if(!phoneNumber){
      return AlertIOS.alert('手机号不能为空')
    }

    var body={
      phoneNumber:phoneNumber
    }

    var signupURL=config.api.base+config.api.signup

    request.post(signupURL,body)
      .then((data)=>{
        console.log(data)
        if(data&&data.success){
          this._showVerifyCode()
        }else{
          AlertIOS.alert('获取验证码失败，请检查手机号是否正确')
        }
      })
      .catch((err)=>{
        AlertIOS.alert('获取验证码失败，请检查网络是否良好1')
      })
  },
  //改变验证码发送状态
  _showVerifyCode(){
    this.setState({
      countingDone:false,
      codeSent:true
    })
  },
  //倒计时结束
  _countingDone(){
    this.setState({
      countingDone:true
    })
  },

  //登录
  _submit(){
    var phoneNumber=this.state.phoneNumber
    var verifyCode=this.state.verifyCode
    if(!phoneNumber||!verifyCode){
      return AlertIOS.alert('手机号或验证码不能为空！')
    }

    var body={
      phoneNumber:phoneNumber,
      verifyCode:verifyCode
    }

    var verifyURL=config.api.base+config.api.verify

    request.post(verifyURL,body)
      .then((data)=>{
        if(data&&data.success){
          this.props.afterLondin(data.data)
        }else{
          AlertIOS.alert('获取验证码失败，请检查手机号是否正确')
        }
      })
      .catch((err)=>{
        AlertIOS.alert('获取验证码失败，请检查网络是否良好1')
      })
  },
})


var styles = StyleSheet.create({
  container: {
    flex: 1,
    //justifyContent: 'center',
    //alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding:10
  },
  signupBox:{
    marginTop:30
  },
  title:{
    marginBottom:20,
    color:'#333',
    fontSize:20,
    textAlign:'center'
  },
  inputField:{
    //flex:1,
    //width:99,
    height:40,
    padding:5,
    color:'#666',
    fontSize:16,
    backgroundColor:'#fff',
    borderRadius:4
  },
  inputField2:{
    flex:1,
    //width:99,
    height:40,
    padding:5,
    color:'#666',
    fontSize:16,
    backgroundColor:'#fff',
    borderRadius:4
  },
  btn:{
    padding:10,
    marginTop:10,
    backgroundColor:'transparent',
    borderColor:'#ee735c',
    borderWidth:1,
    borderRadius:4,
    color:'#ee235c'
  },

  verifyCodeBox:{
    //width:100,
    marginTop:10,
    flexDirection:'row',
    justifyContent:'space-between'
  },
  countBtn:{
    width:130,
    height:40,
    padding:10,
    marginLeft:8,
    backgroundColor:'#ee735c',
    color:'#fff',
    borderColor:'#ee735c',
    textAlign:'center',
    fontWeight:'600',
    fontSize:15, 
    borderRadius:2
  }
});

module.exports=Login