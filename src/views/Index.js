import React, { Component } from 'react';
import { View, FlatList } from 'react-native';
import { Card, Image, Text, Icon, Divider, SearchBar } from 'react-native-elements';

import util from '../util/axios';
export default class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ds: [],
      city: '厦门', //城市
      count: 100, //条数
      start: 1, //页数
      apiKey: '0df993c66c0c636e29ecbb5344252a4a', //key
      search: '',
      loading: false
    };
  }
  fetchRecords = () => {
    util.get(
      'http://api.douban.com/v2/movie/in_theaters?city=' + this.state.city + '&apikey=' + this.state.apiKey + '&start=' + this.state.start + '&count=' + this.state.count + '',
      (res) => {
        this.setState({ ds: this.state.ds.concat(res.subjects) });
        // this.setState({ count: this.state.count });
      }
    );
  };
  componentDidMount() {
    this.fetchRecords();
  }

  select = () => {
    util.get(
      'http://api.douban.com/v2/movie/search?q=' + this.state.search + '&apikey=' + this.state.apiKey + '&start=' + this.state.start + '&count=' + this.state.count + '',
      (res) => {
        console.log(res);
      }
    );
  };

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
              <Text Style={{ fontWeight: '900' }}>{item.title.length > 11 ? item.title.slice(0, 11) : item.title}</Text>
            </View>
            {/*//上演时间*/}
            <View style={{ paddingTop: 10 }}>
              <Text Style={{ fontSize: 18, opacity: 0.7 }}>{item.year}</Text>
            </View>
            {/*评分*/}
            <View
              style={{
                paddingTop: 10,
                display: 'flex',
                flexDirection: 'row'
              }}
            >
              <Text Style={{ opacity: 0.7, fontSize: 15 }}>评分:</Text>
              <Text
                Style={{
                  opacity: 0.7,
                  fontSize: 15,
                  color: 'red',
                  marginLeft: 8
                }}
              >
                {item.rating.average}
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
          </View>
        </View>
      </Card>
    );
  }

  render() {
    const { search } = this.state;
    const { loading } = this.state;
    return (
      <View>
        {/*傻逼豆瓣不提供搜索API*/}
        {/*<SearchBar*/}
        {/*  platform={'android'}*/}
        {/*  showLoading={loading}*/}
        {/*  inputContainerStyle={{ backgroundColor: '#dcdce1', borderRadius: 10 }}*/}
        {/*  containerStyle={{ backgroundColor: '#f5f5f5', margin: 4 }}*/}
        {/*  placeholder="请输入你要搜索的关键字"*/}
        {/*  onBlur={this.select}*/}
        {/*  value={search}*/}
        {/*  onChangeText={this.updateSearch}*/}
        {/*/>*/}
        <FlatList
          extraData={this.state}
          removeClippedSubviews={true}
          data={this.state.ds}
          windowSize={10}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => this.renderCard(item)}
        />
      </View>
    );
  }
}
