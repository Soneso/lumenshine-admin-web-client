export default {
  userList: state => state.userList,
  userListStatus: state => ({ err: state.userListError, res: state.userList, loading: state.userListLoading }),

  account: state => publicKey => state.accountList.find(acc => acc.public_key === publicKey),
  accountList: state => state.accountList,
  accountListStatus: state => ({ err: state.accountListError, res: state.accountList, loading: state.accountListLoading }),

  knownCurrenciesList: state => state.knownCurrenciesList,
  knownCurrenciesListStatus: state => ({ err: state.knownCurrenciesListError, res: state.knownCurrenciesList, loading: state.knownCurrenciesListLoading }),

  knownInflationDestinationsList: state => state.knownInflationDestinationsList,
  knownInflationDestinationsListStatus: state => ({ err: state.knownInflationDestinationsListError, res: state.knownInflationDestinationsList, loading: state.knownInflationDestinationsListLoading }),
};
