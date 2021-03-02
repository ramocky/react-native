import React, { Component } from 'react';
import { createAppContainer, createNavigator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { Icon } from 'react-native-elements';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import Index from './src/views/Index';
import Login from './src/views/Login';
import About from './src/views/About';
import bottomNavigator from './src/component/BottomTab';
import './src/util/global.js';
//垃圾RN 相关导航问题链接https://blog.csdn.net/qq_30405009/article/details/86597822
//大概思路创建BottomTabNavigator，而后在statck中定义这个路由，就是嵌套在statk中，将底部导航器也创建。
//RN版本更新

const MyStack = createStackNavigator(
  {
    bottomTabNavigator: {
      screen: bottomNavigator,
      navigationOptions: { header: null }
    },
    Index: {
      screen: Index,
      navigationOptions: ({ navigation }) => ({
        headerShown: false
      })
    },
    About: {
      screen: Index,
      navigationOptions: ({ navigation }) => ({
        headerShown: false
      })
    },
    Login: {
      screen: Login,
      navigationOptions: ({ navigation }) => ({
        headerShown: false
      })
    }
  },
  {
    initialRouteName: 'Login',
    mode: 'card '
  }
);

const AppContainer = createAppContainer(MyStack);
export default class App extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return <AppContainer />;
  }
}
