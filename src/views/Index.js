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

  renderCard(item, index) {
    return (
      <Card key={index}>
        <View style={{ flexDirection: 'column', alignItems: 'center', borderRadius: 20 }}>
          <Image source={{ uri: item.picUrl }} style={{ width: 220, height: 220, marginBottom: 20, borderRadius: 20 }} />
          <Text style={{ marginBottom: 20 }} key={item.pic}>
            {item.name}
          </Text>
          <Icon
            name="play-circle"
            type="feather"
            iconStyle={{ height: 25, width: 25, marginLeft: 10, marginRight: 10 }}
            size={25}
            color="#0066CC"
            onPress={() => this.playVideo(item.id)}
          />
        </View>
      </Card>
    );
  }
  UNSAFE_componentWillMount() {
    util.get('https://netease-cloud-music-api-azure.vercel.app/recommend/songs', (res) => {
      let arrList = res.data.dailySongs;
      arrList.map((item, index) => {
        arrList[index].picUrl = item.al.picUrl;
      });
      this.setState({
        list: arrList
      });
    });
  }
  //播放音乐
  playVideo(id) {
    util.get('https://netease-cloud-music-api-azure.vercel.app/song/url?id=' + id, (res) => {
      console.log('====================================');
      console.log(res.data.url);
      console.log('====================================');
    });
  }
  render() {
    return (
      <View style={{ marginBottom: 10 }}>
        <FlatList windowSize={10} keyExtractor={(item) => item.name} data={this.state.list} renderItem={({ item, index }) => this.renderCard(item, index)} />
      </View>
    );
  }
}
