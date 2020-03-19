import axios from 'axios';
import { Alert } from 'react-native';

axios.headers = {
  'Content-Type': 'application/json;charset=UTF-8'
};
//请求拦截器
axios.interceptors.request.use(
  function(config) {
    return config;
  },
  function(error) {
    return Promise.reject(error); // 请求出错
  }
);

//返回拦截器
axios.interceptors.response.use(
  function(response) {
    if (response.status !== 200) {
      // 服务端出现了一些问题的情况下
      Alert.alert('温馨提示', response.status);
      // 等等按钮事件
      return Promise.reject(response.status);
    } else {
      // 服务端一切正常 返回data数据
      return response.data;
    }
  },
  function(error) {
    return Promise.reject(error);
  }
);

function get(url, success) {
  return axios({
    method: 'GET',
    url: url,
    header: { Accept: 'application/json' }
  })
    .then(success)
    .catch(err => {
      console.error('错误' + err);
    })
    .catch(err => {
      Alert.alert('GET错误！', err);
    });
}

function post(url, data, success) {
  return axios({
    method: 'POST',
    url: url,
    data: data
  })
    .then(res => {
      console.log(res.data);
    })
    .catch(err => {
      Alert.alert('POST错误！', err);
    });
}
export default {
  get,
  post
};
