import StellarSdk from 'stellar-sdk';

import UserService from '@/services/user';
import AccountService from '@/services/account';
import KnownCurrenciesService from '@/services/known_currencies';
import KnownInflationDestinationsService from '@/services/known_inflation_destinations';

const horizonServer = new StellarSdk.Server(process.env.HORIZON_URL);

export default {
  async resetState ({ commit }) {
    commit('RESET');
  },

  async getUserInfo ({ commit }) {
    commit('SET_USER_INFO_LOADING', true);
    try {
      const res = await UserService.getUserInfo();
      commit('SET_USER_INFO', res);
    } catch (err) {
      commit('SET_USER_INFO_ERROR', err.data);
    }
    commit('SET_USER_INFO_LOADING', false);
  },
  async getUserList ({ commit }) {
    commit('SET_USER_LIST_LOADING', true);
    try {
      const res = await UserService.getUserList();
      commit('SET_USER_LIST', res);
    } catch (err) {
      commit('SET_USER_LIST_ERROR', err.data);
    }
    commit('SET_USER_LIST_LOADING', false);
  },

  // loads / updates each account (loads Stellar data too)
  async getAccountList ({ commit }) {
    commit('SET_ACCOUNT_LIST_LOADING', true);
    try {
      const backendRes = await AccountService.getAccountList();
      const stellarAccounts = await Promise.all(
        backendRes.map(account =>
          horizonServer.loadAccount(account.public_key).catch(err => err)
        )
      );
      const extended = backendRes.map(account => {
        const stellarRes = stellarAccounts.find(acc => acc.id === account.public_key);
        if (stellarRes) {
          return {...account, ...stellarRes};
        }
        return account;
      });

      commit('SET_ACCOUNT_LIST', extended);
    } catch (err) {
      commit('SET_ACCOUNT_LIST_ERROR', err.data);
    }
    commit('SET_ACCOUNT_LIST_LOADING', false);
  },

  // loads / updates a single account (loads Stellar data too)
  async getAccountDetails ({ getters, commit }, publicKey) {
    try {
      const list = [...(getters.accountList || {})];
      const acc = list.find(acc => acc.public_key === publicKey) || {};

      const [ backendRes, stellarRes ] = await Promise.all([
        AccountService.getAccountDetails(publicKey),
        horizonServer.loadAccount(publicKey).catch(err => err)
      ]);
      commit('SET_ACCOUNT', {
        ...acc,
        ...backendRes,
        ...(!(stellarRes instanceof Error) ? stellarRes : {}),
        detailsLoaded: true
      });
    } catch (err) {
      commit('SET_ACCOUNT_LIST_ERROR', err.data);
    }
  },

  async getKnownCurrenciesList ({ commit }) {
    commit('SET_KNOWN_CURRENCIES_LIST_LOADING', true);
    try {
      const res = await KnownCurrenciesService.getKnownCurrenciesList();
      commit('SET_KNOWN_CURRENCIES_LIST', res);
    } catch (err) {
      commit('SET_KNOWN_CURRENCIES_LIST_ERROR', err.data);
    }
    commit('SET_KNOWN_CURRENCIES_LIST_LOADING', false);
  },

  async getKnownInflationDestinationsList ({ commit }) {
    commit('SET_KNOWN_INFLATION_DESTINATIONS_LIST_LOADING', true);
    try {
      const res = await KnownInflationDestinationsService.getKnownInflationDestinationsList();
      commit('SET_KNOWN_INFLATION_DESTINATIONS_LIST', res);
    } catch (err) {
      commit('SET_KNOWN_INFLATION_DESTINATIONS_LIST_ERROR', err.data);
    }
    commit('SET_KNOWN_INFLATION_DESTINATIONS_LIST_LOADING', false);
  },

};
