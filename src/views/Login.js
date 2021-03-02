import React, { Component } from 'react';
import { StyleSheet, TextInput, View, KeyboardAvoidingView, Alert } from 'react-native';
import { Avatar, Button, Icon, Text, Image } from 'react-native-elements';
import util from '../util/axios';
export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pwd: '',
      name: '',
      loading: false
    };
  }
  componentDidMount() {
    //免登陆
    if (global.cookie != ' ') {
      this.props.navigation.navigate('Index');
    }
  }
  handLogin = () => {
    this.setState({ loading: true });
    util.get('https://netease-cloud-music-api-azure.vercel.app/login/cellphone?phone=' + this.state.name + '&password=' + this.state.pwd, (res) => {
    if (res.cookie) {
        global.cookie = res.cookie;
        this.props.navigation.navigate('bottomTabNavigator');
      } else {
        Alert.alert('提示', '密码错误,请输入正确的账号密码');
      }
      this.setState({ loading: false });
    });
  };

  render() {
    return (
      <KeyboardAvoidingView style={styles.bg}>
        <Icon name="headphones" type="feather" iconStyle={{ height: 120, marginTop: 60 }} size={100} color="black" />
        <Text h3 h3Style={{ fontWeight: '100' }} style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'center', textAlign: 'center' }}>
          Romocky音乐
        </Text>
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
          secureTextEntry={true}
          onChangeText={(text) => {
            this.setState({ pwd: text });
          }}
        />
        <View style={{ marginTop: 20 }}>
          <Button
            title="登录"
            buttonStyle={{ backgroundColor: '#000000' }}
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
          <Text style={{ lineHeight: 25 }}>第三方登录:</Text>
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-around', width: 35 }}>
            <Icon name="QQ" type="antdesign" iconStyle={{ height: 25, width: 25, marginLeft: 10 }} size={25} color="#0066CC" />
            <Icon name="wechat" type="antdesign" iconStyle={{ height: 25, width: 25 }} size={25} color="#336633" />
            <Icon name="weibo" type="antdesign" iconSt yle={{ height: 25, width: 25 }} size={25} color="#FF0033" />
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    padding: 30
  },
  input: {
    borderColor: '#000000',
    borderBottomWidth: 1.5,
    margin: 0,
    lineHeight: 1,
    padding: 0,
    marginTop: 30,
    marginBottom: 20
  },
  button: {
    borderRadius: 55,
    borderWidth: 1
  }
});
