'use strict'

var queryString=require('query-string');//对参数进行拼接
var _=require('lodash')//对象替换获取继承
var Mock=require('mockjs')
var config=require('./config');


var request={}
request.get=function(url,params){
	if(params){
		url+='?'+queryString.stringify(params)
	}
	return fetch(url)
		.then((response) => response.json())
		.then((response) => Mock.mock(response))
}

request.post=function(url,body){
	var options=_.extend(config.header,{
		body:JSON.stringify(body)
	})
	return fetch(url,options)
		.then((response) => response.json())
		.then((responseJson) => Mock.mock(responseJson))
}

module.exports=request