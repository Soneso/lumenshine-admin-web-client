import Vue from 'vue';

import ApiUrls from '@/services/apiUrls';

export default {
  async getUserList () {
    const response = await Vue.http({
      url: ApiUrls.Users.AllUsers,
      method: 'GET'
    });
    return response.data.users;
  },
};
