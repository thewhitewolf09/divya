import axios from "axios";

const api = axios.create({
  //baseURL: 'http://192.168.149.165:8080',
  baseURL: "https://divya-blond.vercel.app",
});

export default api;
