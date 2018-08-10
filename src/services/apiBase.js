import axios from 'axios';
import config from '@/config';
import store from '@/store/store';

export default {
  async get (path = '', params = null) {
    if (!store.getters.authToken && axios.defaults.headers.common['Authorization'] !== null) {
      delete axios.defaults.headers.common['Authorization'];
    } else {
      axios.defaults.headers.common['Authorization'] = store.getters.authToken;
    }
    try {
      var response = await axios.get(`${config.API_BASE}${path}`, { params });
    } catch (err) {
      const errorData = err.response.data;
      const newError = new Error(errorData.error_message);
      newError.data = errorData;
      throw newError;
    }
    return response;
  },
  async post (path = '', params = null) {
    if (!store.getters.authToken && axios.defaults.headers.common['Authorization'] !== null) {
      delete axios.defaults.headers.common['Authorization'];
    } else {
      axios.defaults.headers.common['Authorization'] = store.getters.authToken;
    }
    try {
      var response = await axios.post(`${config.API_BASE}${path}`, params);
    } catch (err) {
      const errorData = err.response.data;
      const newError = new Error(errorData.error_message);
      newError.data = errorData;
      throw newError;
    }
    return response;
  }
};
