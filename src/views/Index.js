import React, { Component } from 'react';
import { View, FlatList, TouchableHighlight } from 'react-native';
import { Card, Image, Text, Icon, Divider, SearchBar } from 'react-native-elements';

import util from '../util/axios';
export default class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      list: [{ title: 'Title Text', key: 'item1' }]
    };
  }

  renderCard(item) {
    return (
      <Card key={item.name}>
        <Text>{item.name}</Text>
      </Card>
    );
  }
  UNSAFE_componentWillMount() {
    util.get('https://netease-cloud-music-api-azure.vercel.app/recommend/songs', (res) => {
      this.setState({
        list: res.data.dailySongs
      });
      console.log('====================================');
      console.log(res.data.dailySongs);
      console.log('====================================');
    });
  }
  render() {
    return (
      <View>
        <FlatList extraData={this.state.list} windowSize={10} keyExtractor={(item) => item.name} data={this.state.list} renderItem={({ item }) => this.renderCard(item)} />
      </View>
    );
  }
}
