import axios from 'axios';

const api = axios.create({
  baseURL: 'https://your-backend-api.com', // Replace with your backend API URL
  headers: {
    'Content-Type': 'application/json',
  },
});
