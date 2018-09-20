import Vue from 'vue';

import ApiUrls from '@/services/apiUrls';

export default {
  async getAccountList () {
    const response = await Vue.http({
      url: ApiUrls.Accounts.AllAccounts,
      method: 'GET'
    });
    return response.data;
  },
  async getAccountDetails (publicKey) {
    const response = await Vue.http({
      url: `${ApiUrls.Accounts.GetAccount}/${publicKey}`,
      method: 'GET'
    });
    return response.data;
  },
  async getTrustingAccounts (params) {
    const response = await Vue.http({
      url: `${ApiUrls.Accounts.SearchTrustingAccounts}`,
      method: 'POST',
      params
    });
    return response.data;
  }
};
