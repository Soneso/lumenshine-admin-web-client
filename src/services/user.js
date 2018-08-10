import Vue from 'vue';

import { Urls } from '@/router/urls';

export default {
  async getUserList () {
    const response = await Vue.http({
      url: Urls.Users.AllUsers,
      method: 'GET'
    });
    return response.data.users;
  },
};
