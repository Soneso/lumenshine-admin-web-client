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
  },
  SET_ACCOUNT_LIST_ERROR (state, msg) {
    state.accountListError = msg;
    state.accountList = null;
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

};
