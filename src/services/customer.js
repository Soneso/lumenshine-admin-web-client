import Vue from 'vue';

import ApiUrls from '@/services/apiUrls';

export default {
  async getCustomerList (params) {
    const response = await Vue.http({
      url: ApiUrls.Customers.AllCustomers,
      method: 'GET',
      params,
    });
    return response.data;
  },
  async getCustomerDetails (id) {
    const response = await Vue.http({
      url: `${ApiUrls.Customers.GetCustomer}/${id}`,
      method: 'GET'
    });
    return response.data;
  },
};
