export default {
  SET_USER_LIST (state, msg) {
    state.userList = msg;
    state.userListError = null;
  },
  SET_USER_LIST_LOADING (state, msg) {
    state.userListLoading = msg;
  },
  SET_USER_LIST_ERROR (state, msg) {
    state.userListError = msg;
    state.userList = null;
  },

  SET_ACCOUNT_LIST (state, msg) {
    state.accountList = msg;
    state.accountListError = null;
  },
  SET_ACCOUNT (state, msg) {
    const accIndex = state.accountList.findIndex(acc => acc.public_key === msg.public_key);
    if (accIndex !== -1) {
      const cloned = [...state.accountList];
      cloned[accIndex] = msg;
      state.accountList = cloned;
    } else {
      state.accountList = [...state.accountList, msg];
    }
    state.accountListError = null;
  },
  SET_ACCOUNT_LIST_LOADING (state, msg) {
    state.accountListLoading = msg;
    if (!msg) {
      state.accountListError = null;
    }
  },
  SET_ACCOUNT_LIST_ERROR (state, msg) {
    state.accountListError = msg;
    state.accountList = null;
  },

  SET_CUSTOMER_LIST (state, msg) {
    state.customerList = msg.items;
    state.customerTotalItems = msg.total_count;
    state.customerListError = null;
  },

  SET_CUSTOMER_LIST_LOADING (state, loading) {
    state.customerListLoading = loading;
    if (!loading) {
      state.customerListError = null;
    }
  },

  SET_CUSTOMER_LIST_ERROR (state, msg) {
    state.customerListError = msg;
    state.customerList = null;
  },

  SET_CUSTOMER (state, msg) {
    const accIndex = state.customerList.findIndex(customer => customer.id === msg.id);
    if (accIndex !== -1) {
      const cloned = [...state.customerList];
      cloned[accIndex] = {...cloned[accIndex], ...msg};
      state.customerList = cloned;
    } else {
      state.customerList = [...state.customerList, msg];
    }
    state.customerListError = null;
  },

  SET_KNOWN_CURRENCIES_LIST (state, msg) {
    state.knownCurrenciesList = msg;
    state.knownCurrenciesListError = null;
  },
  SET_KNOWN_CURRENCIES_LIST_LOADING (state, msg) {
    state.knownCurrenciesListLoading = msg;
  },
  SET_KNOWN_CURRENCIES_LIST_ERROR (state, msg) {
    state.knownCurrenciesListError = msg;
    state.knownCurrenciesList = null;
  },

  SET_KNOWN_INFLATION_DESTINATIONS_LIST (state, msg) {
    state.knownInflationDestinationsList = msg;
    state.knownInflationDestinationsListError = null;
  },
  SET_KNOWN_INFLATION_DESTINATIONS_LIST_LOADING (state, msg) {
    state.knownInflationDestinationsListLoading = msg;
  },
  SET_KNOWN_INFLATION_DESTINATIONS_LIST_ERROR (state, msg) {
    state.knownInflationDestinationsListError = msg;
    state.knownInflationDestinationsList = null;
  },

  SET_STATIC_DATA (state, data) {
    if (!data) {
      state.staticDataLoaded = false;
      return;
    }
    state.languageList = data.languages;
    state.occupationList = data.occupations;
    state.countryList = data.countries;
    state.salutationList = data.salutations;
    state.staticDataLoaded = true;
  },
};
