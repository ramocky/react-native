import axios from 'axios';
import { Alert } from 'react-native';

axios.headers = {
  'Content-Type': 'application/json;charset=UTF-8',
  withCredentials: true
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
    // 服务端一切正常 返回data数据
    return Promise.resolve(response.data);
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
    .catch((err) => {
      Alert.alert('POST错误！', err);
    });
}

function post(url, data, success) {
  return axios({
    method: 'POST',
    url: url,
    data: data
  })
    .then(success)
    .catch((err) => {
      Alert.alert('POST错误！', err);
    });
}
export default {
  get,
  post
};
