import React from 'react';
//var Icon=require('react-native-vector-icons/Ionicons');
import Icon from 'react-native-vector-icons/Ionicons';
var sha1=require('sha1')
//var ImagePicker=require('NativeModulse').ImagePickerManager
//var ImagePicker = require('react-native-image-picker')
import * as ImagePicker from 'react-native-image-picker';
var Progress=require('react-native-progress')
//import * as Progress from 'react-native-progress';
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
  TouchableOpacity,
  Dimensions,
  Image,
  AsyncStorage,
  AlertIOS,
  Modal,
  TextInput
} from 'react-native';

var width=Dimensions.get('window').width//获取屏幕宽度

//相册使用参数
var photoOptions = {
  title: '选着头像',
  customButtons: {
    'Choose Photo from Facebook': 'fb',
  },
  cancelButtonTitle:'取消',//取消按钮
  takePhotoButtonTitle:'拍照',
  chooseFromLibraryButtonTitle:'从相册选择',
  quality:0.75,//
  allowsEditing:true,//是否允许拉伸剪裁
  noData:false,//如果是true就不会转成base64
  storageOptions: { //
    skipBackup: true, 
    path: 'images'
  }
};




function avatar(id,type){
  if(id.indexOf('http')>-1){
    return id
  }
  if(id.indexOf('data:image')>-1){
    return id
  }
  if(id.indexOf('avatar/')>-1){
    return config.cloudinary.base+'/'+type+'/upload/'+id
  }

  return 'http://p5oaue0x1.bkt.clouddn.com/'+id
  
}

var Account =React.createClass({
  //初始状态时，通过属性状态
  getInitialState: function() {
    var user=this.props.user||{}
    console.log(ImagePicker)
    return {
       user:user,
       avatarProgress:0,//上传头像进度
       avatarUploading:false,//图片是否在上传中
       modalVisible:false,//是否可见浮窗
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
        //清空缓存存储头像
        //user.avatar=''
        //AsyncStorage.setItem('user',JSON.stringify(user))
        //清空缓存存储头像

        if(user&&user.accessToken){
          this.setState({
            user:user
          })
        }
      })   
  },
  render: function() {
    var user=this.state.user
    return (
      <View style={styles.container}>
        <View style={styles.toolbar}>
          <Text style={styles.toolbarTitle}>我的账户</Text>
          <Text onPress={this._eidit} style={styles.toolbarExtra}>编辑</Text>
        </View>
        {
          user.avatar
          ?<TouchableOpacity style={styles.avatarContainer} onPress={this._pickPhoto}>
            <Image source={{uri:avatar(user.avatar,'image')}} style={styles.avatarContainer}>
              <View style={styles.avatarBox}>
                {
                  this.state.avatarUploading
                  ?<Progress.Circle 
                    showsText={true}
                    color={'#ee735c'}
                    progress={this.state.avatarProgress}
                    size={75} />
                  :<Image
                    source={{uri:avatar(user.avatar,'image')}}
                    style={styles.avatar}
                  />
                }
              </View>
              <Text style={styles.avatarTip}>更换头像</Text> 
            </Image>
          </TouchableOpacity>
          :<TouchableOpacity style={styles.avatarContainer} onPress={this._pickPhoto}>
            <Text style={styles.avatarTip}>添加头像</Text>
            <View style={styles.avatarBox}>
              {
                this.state.avatarUploading
                ?<Progress.Circle 
                  showsText={true}
                  color={'#ee735c'}
                  progress={this.state.avatarProgress}
                  size={75} />
                :<Icon style={styles.plusIcon} name="ios-play" />
              }
            </View>
          </TouchableOpacity>
        }
        <Modal
          animationType={'fade'}//定义浮层出现形式
          visible={this.state.modalVisible}//是否可见
          >
          <View style={styles.modalContainer}>
            <Icon
              onPress={this._closeModal}
              name='ios-close-outline'
              style={styles.closeIcon}
             />
            <View style={styles.fieldItem}>
              <Text style={styles.label}>昵称</Text>
              <TextInput 
                style={styles.inputField} 
                placeholder='输入你的昵称'
                autoCapitalize={'none'}//配置大小写
                autoCorrect={false}//要不要自动纠正
                defaultValue={user.nickname}//初始值
                onChangeText={(text)=>{
                  this._changeUserState('nickname',text)
                }}//输入文案触发
              />
            </View>
            <View style={styles.fieldItem}>
              <Text style={styles.label}>品种</Text>
              <TextInput 
                style={styles.inputField} 
                placeholder='狗狗的品种'
                autoCapitalize={'none'}//配置大小写
                autoCorrect={false}//要不要自动纠正
                defaultValue={user.breed}//初始值
                onChangeText={(text)=>{
                  this._changeUserState('breed',text)
                }}//输入文案触发
              />
            </View>
            <View style={styles.fieldItem}>
              <Text style={styles.label}>年龄</Text>
              <TextInput 
                style={styles.inputField} 
                placeholder='狗狗的年龄'
                keyboardType={'number-pad'}//键盘配置
                autoCapitalize={'none'}//配置大小写
                autoCorrect={false}//要不要自动纠正
                defaultValue={user.age}//初始值
                onChangeText={(text)=>{
                  this._changeUserState('age',text)
                }}//输入文案触发
              />
            </View>
            <View style={styles.fieldItem}>
              <Text style={styles.label}>性别</Text>
              <Icon.Button 
                onPress={()=>{
                  this._changeUserState('gender','male')
                }}
                style={[
                  styles.gender,
                  user.gender==='male'&&styles.genderChecked
                ]}
                name='ios-paw'>男</Icon.Button>
              <Icon.Button 
                onPress={()=>{
                  this._changeUserState('gender','female')
                }}
                style={[
                  styles.gender,
                  user.gender==='female'&&styles.genderChecked
                ]}
                name='ios-paw-outline'>女</Icon.Button>
            </View>
            <Button
              style={styles.btn}
              onPress={this._submit}
            >保存资料</Button>
          </View>
        </Modal>
        <Button
          style={styles.btn}
          onPress={this._logout}
        >退出登录</Button>
      </View>
    );
  },

  //获取签名
  _getQiniuToken(){
    var accessToken=this.state.user.accessToken//拿到token
    var signatureUrl=config.api.base+config.api.signature//获取签名的地址
    return request.post(signatureUrl,{
      accessToken:accessToken,
      cloud:'qiniu'
    })
      .catch((err)=>{
        console.log(err)
      })
  },
  //选着照片
  _pickPhoto(){
    //console.log(ImagePicker)
    var that=this;
    ImagePicker.showImagePicker(photoOptions, (res) => {
      //console.log('res = ', res);

      //如果用户取消了操作
      if (res.didCancel) {
        console.log('User cancelled image picker');
        return
      }
      //拿到图像数据
      var avatarData='data:image/jpeg;base64,'+res.data

      var uri=res.uri
      that._getQiniuToken()
        .then((data)=>{
          console.log(data)
          if(data&&data.success){
            var token=data.data.token
            var key=data.data.key

            var body=new FormData()
            body.append('token',token)
            body.append('key',key)
            body.append('file',{
              type:'image/png',
              uri:uri,
              name:key
            })
            that._upload(body)
          }
        })

      // request.post(signatureUrl,{
      //   accessToken:accessToken,
      //   key:key
      //   timestamp:timestamp,
      //   type:'avatar'//告诉是什么类型的上传
      // })
      //   .catch((err)=>{
      //     console.log('请求签名错误')
      //     console.log(err)
      //     AlertIOS.alert('请求签名错误')
      //   })
      //   .then((data)=>{
      //     console.log(data)
      //     if(data&&data.success){
      //       console.log('请求签名')
      //       console.log(data)
      //       var signature=data.data

      //       var body=new FormData()
      //       body.append('folder',folder)
      //       body.append('signature',signature)
      //       body.append('tags',tags)
      //       body.append('timestamp',timestamp)
      //       body.append('api_key',config.cloudinary.api_key)
      //       body.append('resource_type','image')
      //       body.append('file',avatarData)
      //       that._upload(body)
      //     }
      //   })


    });
  },
  //上传图片
  _upload(body){
    console.log(body)
    var that=this
    this.setState({
      avatarUploading:true,
      avatarProgress:0
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
        var user=this.state.user
        user.avatar=response.key
        that.setState({
          avatarUploading:false,
          avatarProgress:0,
          user:user
        })

        that._asyncUser(true)
      }
    }

    //上传状态
    if(xhr.upload){
      xhr.upload.onprogress=(event)=>{
        if(event.lengthComputable){
          var percent=Number((event.loaded/event.total).toFixed(2))
          console.log(percent)
          that.setState({
            avatarProgress:percent
          })
        }
      }
    }
    //执行请求
    xhr.send(body)
  },

  //对上传的图片返回给后台
  _asyncUser(isAvatar){
    var that=this
    var user=this.state.user
    if(user&&user.accessToken){
      var url=config.api.base+config.api.update
      request.post(url,user)
        .then((data)=>{
          
          if(data&&data.success){
            var user =data.data
            if(isAvatar){
              AlertIOS.alert('头像更新成功')
            }
            that.setState({
              user:user
            },function(){
              that._closeModal()
              AsyncStorage.setItem('user',JSON.stringify(user))
            })
          }
        })
    }
  },
  //模态窗状态 打开
  _eidit(){
    this.setState({
      modalVisible:true
    })
  },
  //模态窗状态 关闭
  _closeModal(){
    this.setState({
      modalVisible:false
    })
  },
  //编辑文档个人信息
  _changeUserState(key,value){
    var user=this.state.user
    user[key]=value
    this.setState({
      user:user
    })
  },
  //保存用户信息
  _submit(){
    this._asyncUser()
  },
  //退出登录
  _logout(){
    this.props.logout()
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
  avatarContainer:{
    width:width,
    height:140,
    alignItems:'center',
    justifyContent:'center',
    backgroundColor:'#666'
  },
  avatarTip:{
    color:'#fff',
    backgroundColor:'transparent',
    fontSize:14
  },
  avatar:{
    marginBottom:15,
    width:width*0.2,
    height:width*0.2,
    resizeMode:'cover',
    borderRadius:width*0.1,
    borderWidth:1,
    borderColor:'#ccc'
  },
  avatarBox:{
    marginTop:15,
    alignItems:'center',
    justifyContent:'center'
  },
  plusIcon:{
    padding:20,
    paddingLeft:25,
    paddingRight:25,
    color:'#999',
    fontSize:25,
    backgroundColor:'#fff',
    borderRadius:8
  },

  modalContainer:{
    flex:1,
    paddingTop:50,
    borderBottomColor:'#fff',
  },
  closeIcon:{
    alignSelf:'center',
    fontSize:30,
    color:'#ee753c'
  },
  fieldItem:{
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    height:50,
    paddingLeft:15,
    paddingRight:15,
    borderColor:'#eee',
    borderBottomWidth:1
  },
  label:{
    color:'#ccc',
    marginRight:10
  },
  inputField:{
    height:50,
    flex:1,
    color:'#666',
    fontSize:14
  },
  gender:{
    backgroundColor:'#ccc'
  },
  genderChecked:{
    backgroundColor:'#ee735c'
  },
  btn:{
    padding:10,
    marginTop:10,
    backgroundColor:'transparent',
    borderColor:'#ee735c',
    borderWidth:1,
    borderRadius:4,
    color:'#ee235c',
    marginRight:10,
    marginLeft:10,
    marginTop:25
  }

});

module.exports=Account


