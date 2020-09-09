import { Header, Icon, Text } from 'react-native-elements';
import { TouchableHighlight, View } from 'react-native';
import React, { Component } from 'react';
export default class Head extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: ''
    };
  }
  handleCity = () => {
    this.props.navigation.navigate('Login', { title: '精彩上映' });
  };
  render() {
    return (
      <View>
        <Header
          centerComponent={
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableHighlight
                onPress={() => {
                  this.handleCity();
                }}
              >
                <Icon iconStyle={{ marginRight: 15 }} name="sc-telegram" type="evilicon" size={18} color={'white'} />
              </TouchableHighlight>
              <Text style={{ color: 'white' }}>{this.props.title}</Text>
            </View>
          }
          containerStyle={{
            backgroundColor: 'black',
            justifyContent: 'center'
          }}
        />
      </View>
    );
  }
}
