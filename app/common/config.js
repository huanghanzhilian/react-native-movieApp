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
		base:'http://192.168.0.104:1234/',
		//base:'http://localhost:1234/',
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
	}
}