import Vue from 'vue';

import { Urls } from '@/router/urls';

export default {
  async getAccountList () {
    const response = await Vue.http({
      url: Urls.Accounts.AllAccounts,
      method: 'GET'
    });
    return response.data;
  },
  async getAccountDetails (publicKey) {
    const response = await Vue.http({
      url: `${Urls.Accounts.GetAccount}/${publicKey}`,
      method: 'GET'
    });
    return response.data;
  },
};
