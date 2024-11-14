import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.70.165:8080',
});

export default api;
