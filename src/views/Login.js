import React, { Component } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Avatar, Button, Icon, Text, Image } from 'react-native-elements';
import util from '../util/axios';
export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      isVisible: false,
      url: {},
      city: '厦门', //城市
      count: 30, //条数
      start: 1, //页数
      apiKey: '0df993c66c0c636e29ecbb5344252a4a', //key
      img: 'http://img3.doubanio.com/view/photo/s_ratio_poster/public/p2576090251.jpg'
    };
  }

  handLogin = () => {
    this.setState({ loading: true });
    this.props.navigation.navigate('Index');
    this.setState({ loading: false });
  };
  componentDidMount() {
    // util.get(
    //   'http://api.douban.com/v2/movie/in_theaters?city=' + this.state.city + '&apikey=' + this.state.apiKey + '&start=' + this.state.start + '&count=' + this.state.count + '',
    //   (res) => {
    //     var temp = [];
    //     res.subjects.forEach((item) => {
    //       temp.push(item.images.small);
    //     });
    //     this.setState({ url: temp });
    //
    //     this.setState({ img: temp[0] });
    //     var i = 1;
    //     setInterval(() => {
    //       i = i + 1;
    //       console.log(temp[i]);
    //       this.setState({ img: temp[i] });
    //     }, 5000);
    //   }
    // );
  }

  render() {
    return (
      <View style={styles.bg}>
        <Icon name="film" type="feather" iconStyle={{ height: 100, marginTop: 80 }} size={90} color="#17202A" />
        <TextInput
          placeholder={'请输入用户名'}
          style={styles.input}
          onChangeText={(text) => {
            this.setState({ name: text });
          }}
        />
        <TextInput
          placeholder={'请输入密码'}
          style={styles.input}
          value={this.state.pwd}
          onChangeText={(text) => {
            this.setState({ pwd: text });
          }}
        />
        <View style={{ marginTop: 20 }}>
          <Button
            title="登录"
            buttonStyle={{ backgroundColor: 'black' }}
            onPress={() => {
              this.handLogin();
            }}
            loading={this.state.loading}
          />
        </View>
        <View
          style={{
            marginTop: 30,
            flexDirection: 'row',
            alignContent: 'center'
          }}
        >
          <Text>第三方登录:</Text>
          <Avatar
            rounded
            style={{
              height: 25,
              width: 25,
              size: 'small',
              marginLeft: 20
            }}
            source={{
              uri: 'https://cdn.maczd.com/img/2017/07/2514005481.jpg'
            }}
          />
          <Avatar
            rounded
            style={{
              height: 25,
              width: 25,
              size: 'small',
              marginLeft: 20
            }}
            source={{
              uri: 'https://pic1.zhimg.com/v2-f3af130de9a94ff8ec1038ace2663f94_b.jpg    '
            }}
          />
          <Avatar
            rounded
            style={{
              height: 25,
              width: 25,
              size: 'small',
              marginLeft: 20
            }}
            source={{
              uri: 'https://pic1.zhimg.com/v2-ee30674727ce06aa24e10801f9f09f09_1200x500.jpg'
            }}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    padding: 30
  },
  input: {
    borderColor: 'black',
    borderBottomWidth: 1,
    margin: 0,
    lineHeight: 0,
    padding: 0,
    marginTop: 50
  },
  button: {
    borderRadius: 55,
    borderWidth: 1
  }
});
