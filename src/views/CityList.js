import React, { Component } from 'react';
import { ListItem } from 'react-native-elements';
import { View } from 'react-native';
const list = [
  {
    name: 'Amy Farha',
    avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg',
    subtitle: 'Vice President'
  },
  {
    name: 'Chris Jackson',
    avatar_url: 'https://s3.amazonaws.com/uifaces/faces/twitter/adhamdannaway/128.jpg',
    subtitle: 'Vice Chairman'
  }
];
export default class CityList extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <View>
        {list.map((l, i) => (
          <ListItem key={i} leftAvatar={{ source: { uri: l.avatar_url } }} title={l.name} subtitle={l.subtitle} bottomDivider />
        ))}
      </View>
    );
  }
}
