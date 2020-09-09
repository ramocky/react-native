import React, { Component } from 'react';
import { View, FlatList, navigation } from 'react-native';
import { Card, Image, Text, Icon, Divider } from 'react-native-elements';
import util from '../util/axios';
import headTitle from '../util/headTitle';
export default class About extends Component {
  static navigationOptions = {
    // headerTitle instead of title
    head: () => <headTitle />
  };
  constructor(props) {
    super(props);
    this.state = {
      ds: [],
      city: '广东', //城市
      count: 10, //条数
      start: 1, //页数
      apiKey: '0df993c66c0c636e29ecbb5344252a4a', //key
      search: ''
    };
  }
  fetchRecords = () => {
    util.get(
      'http://api.douban.com/v2/movie/coming_soon?city=' +
        this.state.city +
        '&apikey=' +
        this.state.apiKey +
        '&start=' +
        this.state.start +
        '&count=' +
        this.state.count +
        '&total=100',
      (res) => {
        this.setState({ ds: this.state.ds.concat(res.subjects) });
        console.log(res);
      }
    );
  };
  componentDidMount() {
    this.fetchRecords();
  }
  updateSearch = (search) => {
    this.setState({ search });
  };
  selectAddress = () => {};
  renderCard(item) {
    return (
      <Card>
        <View style={{ display: 'flex', flexDirection: 'row' }}>
          <View>
            <Image source={{ uri: item.images.small }} style={{ width: 120, height: 160 }} />
          </View>
          <View
            style={{
              marginLeft: 25,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start'
            }}
          >
            <View>
              <Text h4 h4Style={{ fontWeight: 'bold', fontSize: 15 }}>
                {item.title.length > 11 ? item.title.slice(0, 11) : item.title}
              </Text>
            </View>

            {/*评分*/}
            <View
              style={{
                paddingTop: 10,
                display: 'flex',
                flexDirection: 'row'
              }}
            >
              <Text Style={{ opacity: 0.7, fontSize: 15 }}>时长:</Text>
              <Text
                Style={{
                  opacity: 0.7,
                  fontSize: 15,
                  color: 'red',
                  marginLeft: 8
                }}
              >
                {item.durations}
              </Text>
            </View>
            {/*导演*/}
            <View
              style={{
                paddingTop: 10,
                display: 'flex',
                flexDirection: 'row'
              }}
            >
              <Text Style={{ opacity: 0.7, fontSize: 15 }}>导演:</Text>
              <Text
                Style={{
                  opacity: 0.7,
                  fontSize: 15,
                  marginLeft: 8
                }}
              >
                {item.directors[0].name}
              </Text>
            </View>
            {/*条件控制渲染类比于v-if主演*/}
            <View
              style={{
                paddingTop: 10,
                display: 'flex',
                flexDirection: 'row'
              }}
            >
              <Text Style={{ opacity: 0.7, fontSize: 15 }}>主演:</Text>

              {item.casts.map((v, i) => {
                return i < 1 ? (
                  <Text
                    key={i}
                    Style={{
                      opacity: 0.7,
                      fontSize: 15,
                      marginLeft: 8
                    }}
                  >
                    {v.name}
                  </Text>
                ) : (
                  <Text key={i} />
                );
              })}
            </View>
            {/*//上演时间*/}
            <View
              style={{
                paddingTop: 10,
                display: 'flex',
                flexDirection: 'row'
              }}
            >
              <Text Style={{ opacity: 0.8, fontSize: 15 }}>上映日期:</Text>
              <Text Style={{ fontWeight: '200', fontSize: 18, opacity: 0.7 }}>{item.mainland_pubdate}</Text>
            </View>
          </View>
        </View>
      </Card>
    );
  }
  render() {
    return (
      <View>
        {/*<Icon name="ios-navigate" type="ionicon" />*/}
        <FlatList
          extraData={this.state}
          removeClippedSubviews={true} // Unmount components when outside of window
          data={this.state.ds}
          windowSize={10}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => this.renderCard(item)}
        />
      </View>
    );
  }
}
