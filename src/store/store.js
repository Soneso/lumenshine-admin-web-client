import Vue from 'vue';
import Vuex from 'vuex';
import VueLocalStorage from 'vue-localstorage';

import mutations from './mutations';
import actions from './actions';
import getters from './getters';

Vue.use(VueLocalStorage);
Vue.use(Vuex);

function initialState () {
  return {
    userListLoading: false,
    userListError: null,
    userList: [],

    accountListLoading: false,
    accountListError: null,
    accountList: [],

    customerListLoading: false,
    customerListError: null,
    customerList: [],
    customerTotalItems: 0,

    knownCurrenciesListLoading: false,
    knownCurrenciesListError: null,
    knownCurrenciesList: [],

    knownInflationDestinationsListLoading: false,
    knownInflationDestinationsListError: null,
    knownInflationDestinationsList: [],
  };
}

export default new Vuex.Store({
  state: initialState(),
  getters,
  mutations: {
    ...mutations,
    RESET (state) {
      const s = initialState();
      Object.keys(s).forEach(key => {
        state[key] = s[key];
      });
    }
  },
  actions
});
