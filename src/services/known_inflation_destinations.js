import Vue from 'vue';

import { Urls } from '@/router/urls';

export default {
  async getKnownInflationDestinationsList () {
    const response = await Vue.http({
      url: Urls.KnownInflationDestinations.AllInflationDestinations,
      method: 'GET'
    });

    return response.data;
  },
};
