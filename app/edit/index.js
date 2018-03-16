import React, { Component } from 'react';
var Icon=require('react-native-vector-icons/Ionicons');
import {
  TabBarIOS,
  AppRegistry,
  StyleSheet,
  Text,
  View
} from 'react-native';

var Edit =React.createClass({
  render: function() {
    return (
      <View style={styles.container}>
        <Text>编辑页面</Text>
      </View>
    );
  }
})


var styles = StyleSheet.create({
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

module.exports=Edit