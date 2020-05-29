import React, { Component } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Avatar, Button, Icon, Text, Image } from 'react-native-elements';

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      pwd: '',
      loading: false,
      isVisible: false
    };
  }
  handleLogin = () => {
    this.setState({ loading: true });
    setTimeout(() => {
      this.props.navigation.navigate('Index', { title: '精彩上映' });
      this.setState({ loading: false });
    }, 1000);
  };
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
          secureTextEntry={true}
        />
        <View style={{ marginTop: 20 }}>
          <Button
            title="登录"
            buttonStyle={{ backgroundColor: 'black' }}
            onPress={() => {
              this.handleLogin();
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
