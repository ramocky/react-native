import { createBottomTabNavigator } from 'react-navigation-tabs';
import About from '../views/About';
import Index from '../views/Index';
import { createAppContainer } from 'react-navigation';
import Login from '../views/Login';
import { Card, Icon } from 'react-native-elements';
import React from 'react';
import { Text, TouchableNativeFeedback, View } from 'react-native';
// 底部导航栏
const bottomNavigator = createBottomTabNavigator(
  {
    Index: {
      screen: Index,
      navigationOptions: ({ navigation }) => ({
        title: '精彩热映'
      })
    },
    About: {
      screen: About,
      navigationOptions: ({ navigation }) => ({
        title: '即将上映'
      })
    }
    // Login: {
    //   screen: Login,
    //   navigationOptions: ({ navigation }) => ({
    //     headerShown: false,
    //     title: '登录',
    //     tabBarVisible: false
    //   })
    // },
  },
  //实现自定义面板 底部(实现自定义隐藏显示)；
  {
    initialRouteName:'Index',
    defaultNavigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused, horizontal, tintColor }) => {
        const { routeName } = navigation.state;
        if (routeName === 'Index') {
          return <Icon name="ios-videocam" type="ionicon" />;
        }
        if (routeName === 'About') {
          return <Icon name="ios-planet" type="ionicon" />;
        }
      }
    }),
    backBehavior: 'none',
    tabBarOptions: {
      activeTintColor: '#2562b4', // 文字和图片选中颜色
      // inactiveTintColor: '#999999', // 文字和图片默认颜色
      showIcon: true, // android 默认不显示 icon, 需要设置为 true 才会显示
      indicatorStyle: {
        height: 0
      }, // android 中TabBar下面会显示一条线，高度设为 0 后就不显示线了， 不知道还有没有其它方法隐藏？？？
      style: {
        backgroundColor: '#FFFFFF' // TabBar 背景色
      },
      labelStyle: {
        fontSize: 10 // 文字大小
      }
    }
  }
);

export default bottomNavigator;
