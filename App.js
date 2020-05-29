import React, { Component } from 'react';import { createAppContainer, createNavigator } from 'react-navigation';import { createStackNavigator } from 'react-navigation-stack';import { Icon } from 'react-native-elements';import { createBottomTabNavigator } from 'react-navigation-tabs';import Index from './src/views/Index';import Login from './src/views/Login';import bottomNavigator from './src/component/BottomTab';import About from './src/views/About';import Head from './src/util/headTitle';// import headTitle from './src/util/headTitle'//垃圾RN 相关导航问题链接https://blog.csdn.net/qq_30405009/article/details/86597822//大概思路创建BottomTabNavigator，而后在statck中定义这个路由，就是嵌套在statk中，将底部导航器也创建。const MyStack = createStackNavigator(  {    First: {      screen: bottomNavigator,      navigationOptions: ({ navigation }) => ({        header: <Head title="即将上映" />      })    },    Login: {      screen: Login,      navigationOptions: ({ navigation }) => ({})    },    Index: {      screen: Index,      navigationOptions: ({ navigation }) => ({})    },    About: {      screen: About,      navigationOptions: ({ navigation }) => ({})    }  },  {    initialRouteName: 'First',    mode: 'screen '  });// name="ios-videocam"// name="ios-planet"//基础两个bottom路由的路径映射const AppContainer = createAppContainer(MyStack);export default class App extends Component {  constructor(props) {    super(props);  }  render() {    return <AppContainer />;  }}