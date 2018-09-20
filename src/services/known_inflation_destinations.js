import Vue from 'vue';

import ApiUrls from '@/services/apiUrls';

export default {
  async getKnownInflationDestinationsList () {
    const response = await Vue.http({
      url: ApiUrls.KnownInflationDestinations.AllInflationDestinations,
      method: 'GET'
    });

    return response.data;
  },
};
