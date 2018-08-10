import Vue from 'vue';

import { Urls } from '@/router/urls';

export default {
  async getKnownCurrenciesList () {
    const response = await Vue.http({
      url: Urls.KnownCurrencies.AllCurrencies,
      method: 'GET'
    });

    return response.data;
  },
};
