import Vue from 'vue';

import ApiUrls from '@/services/apiUrls';

export default {
  async getKnownCurrenciesList () {
    const response = await Vue.http({
      url: ApiUrls.KnownCurrencies.AllCurrencies,
      method: 'GET'
    });

    return response.data;
  },
};
