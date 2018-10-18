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
      url: `${ApiUrls.Customers.GetCustomerDetails}/${id}`,
      method: 'GET'
    });
    return response.data;
  },
  async getCustomerOrders (id) {
    const response = await Vue.http({
      url: `${ApiUrls.Customers.GetCustomerOrders}/${id}`,
      method: 'GET'
    });
    return response.data;
  },
  async getCustomerWallets (id) {
    const response = await Vue.http({
      url: `${ApiUrls.Customers.GetCustomerWallets}/${id}`,
      method: 'GET'
    });
    return response.data;
  },
};
