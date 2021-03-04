import React, { Component } from 'react';
import { View, FlatList, StyleSheet, Animated, Easing } from 'react-native';
import { Card, Text, Icon } from 'react-native-elements';
import Video from 'react-native-video';
import util from '../util/axios';
export default class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      iconName: 'play-circle',
      refreshing: false,
      loading: false,
      list: [{ title: 'Title Text', key: 'item1' }],
      mpUrl:
        'http://m8.music.126.net/20210304100403/edc8a850ac710433545bef81a4c2cfd8/ymusic/obj/w5zDlMODwrDDiGjCn8Ky/3792007523/29b5/da58/d903/ad79cc60694af4aa0bd8e8df36f2e297.mp3',
      isPlay: false //播放控制开关
    };
    //旋转动画定义
    this.spinValue = new Animated.Value(0);
    this.spinValue.setValue(0);
    this.spin = this.spinValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg']
    });
    this.ami = Animated.timing(this.spinValue, {
      toValue: 1,
      duration: 3000,
      easing: Easing.linear,
      useNativeDriver: true
    });
  }

  componentDidMount() {
    this.getRecommedSongs();
  }

  renderCard(item, index) {
    return (
      <Card key={index}>
        <View style={{ flexDirection: 'column', alignItems: 'center', borderRadius: 20 }}>
          <Animated.Image
            style={[
              styles.circle,
              {
                transform: [
                  {
                    rotate: item.isPlay ? this.spin : '0deg'
                  }
                ]
              }
            ]}
            source={{ uri: item.picUrl }}
            resizeMode="contain"
          />
          <Text style={{ marginBottom: 20 }} key={item.pic}>
            {item.name}
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <Icon
              name="skip-back"
              type="feather"
              iconStyle={{ height: 25, width: 25, marginLeft: 10, marginRight: 10 }}
              size={25}
              color="#0066CC"
              onPress={() => this.playVideo(item.id, item)}
            />
            <Icon
              name={item.iconName}
              type="feather"
              iconStyle={{ height: 25, width: 25, marginLeft: 10, marginRight: 10 }}
              size={25}
              color="#0066CC"
              onPress={() => this.playVideo(item.id, item)}
            />
            <Icon
              name="skip-forward"
              type="feather"
              iconStyle={{ height: 25, width: 25, marginLeft: 10, marginRight: 10 }}
              size={25}
              color="#0066CC"
              onPress={() => this.playVideo(item.id, item)}
            />
          </View>
        </View>
      </Card>
    );
  }

  getRecommedSongs() {
    util.get('/recommend/songs', (res) => {
      let arrList = res.data.dailySongs;
      arrList.map((item, index) => {
        arrList[index].picUrl = item.al.picUrl;
        arrList[index].iconName = 'play-circle';
      });
      this.setState({
        list: arrList
      });
    });
    this.setState({ isPlay: false });
  }
  /*下拉刷新*/
  refresh() {
    this.setState({
      refreshing: true
    });

    setTimeout(() => {
      this.setState({
        refreshing: false
      });
    }, 2000);
    this.getRecommedSongs();
  }
  //旋转方法
  amiStart = () => {
    this.spinValue.setValue(0);
    this.ami.start(() => this.amiStart());
  };

  //播放音乐
  playVideo(id, row) {
    util.get('/song/url?id=' + id, (res) => {
      this.setState({
        mpUrl: res.data[0].url
      });
      this.state.list.map((item) => {
        if (row === item) {
          if (item.iconName === 'pause-circle') {
            item.iconName = 'play-circle';
            item.isPlay = false;
          } else {
            item.iconName = 'pause-circle';
            item.isPlay = true;
          }
          this.setState({ isPlay: true });
          Animated.loop(this.ami).start();
        } else {
          item.isPlay = false;
        }
      });
    });
  }
  render() {
    return (
      <View style={{ marginBottom: 10 }}>
        <FlatList
          extraData={this.state}
          refreshing={this.state.refreshing}
          onRefresh={() => {
            this.refresh();
          }}
          windowSize={10}
          keyExtractor={(item) => item.name}
          data={this.state.list}
          renderItem={({ item, index }) => this.renderCard(item, index)}
        />
        <Video
          source={{ uri: this.state.mpUrl }}
          ref="player"
          rate={this.state.isPlay ? 1 : 0} // 控制暂停/播放，0 代表暂停paused, 1代表播放normal.
          volume={1.0}
          // 声音的放声音的放大倍数大倍数，0 为静音  ，1 为正常音量 ，更大的数字表示放大的倍数
          muted={false} // true代表静音，默认为false.
          paused={false} // true代表暂停，默认为false
          resizeMode="contain" // 视频的自适应伸缩铺放行为，contain、stretch、cover
        />
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00a0e4'
  },
  circle: {
    width: 250,
    height: 250,
    marginBottom: 20,
    borderRadius: 100
  }
});
