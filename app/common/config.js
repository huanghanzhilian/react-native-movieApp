'use strict'

module.exports={
	header:{
		method:'POST',
		headers:{
			'Accept': 'application/json',
    	'Content-Type': 'application/json'
		}
	},
	api:{
		//base:'http://192.168.0.103:1234/',
		base:'http://localhost:1234/',
		// base:'http://rapapi.org/mockjs/31802/',
		//base:'http://localhost:3006/',
		//base:'http://127.0.0.1:3006/',
		//base:'http://192.168.0.6:3006/',
		creations:'api/creations',
		up:'api/up',
		comment:'api/comments',
		signup:'api/u/signup',
		verify:'api/u/verify',
		signature:'api/signature',//获取上传图片签名地址
		update:'api/u/update',//更新用户资料
		video:'api/creations/video'//视频上传同步后台
	},
	qiniu:{
		//upload:'http://upload.qiniu.com/'
		upload:'http://up-z1.qiniup.com'
	},
	cloudinary:{
	    cloud_name: 'de5fw2yto',
	    api_key: '614579213356478',
	    api_secret: 'kj2K8fxkuQPiVWX8xW6ZeQ08izU',
	    base:"http://res.cloudinary.com/de5fw2yto",//图床地址
	    image:"https://api.cloudinary.com/v1_1/de5fw2yto/image/upload",//上传图片地址
	    video:"https://api.cloudinary.com/v1_1/de5fw2yto/video/upload",//上传视频地址
	    audio:"https://api.cloudinary.com/v1_1/de5fw2yto/audio/upload",//上传图片地址
	  }
}