import { Header, Icon, Text } from 'react-native-elements';
import { View } from 'react-native';
import React, { Component } from 'react';

export default class Head extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <Header
        centerComponent={
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon iconStyle={{ marginRight: 15 }} name="ios-navigate" type="ionicon" size={18} color={'white'} />
            <Text style={{ color: 'white' }}>即将上映!</Text>
          </View>
        }
        containerStyle={{
          backgroundColor: 'black',
          justifyContent: 'center'
        }}
      />
    );
  }
}
