// import queryString from '../../node_modules/query-string';

function app (url) {
  return '/portal/admin/dash/' + url;
}

function anon (url) {
  return '/portal/admin/' + url;
}

class UrlReplacer {
  constructor (url) {
    this.Url = url;
  }

  Get (toReplace, withApp = true) {
    let params = [];

    if (Array.isArray(toReplace)) {
      params = toReplace;
    } else {
      params.push(toReplace); // add data to array
    }
    let retUrl = this.Url; // default
    for (const param in params) {
      for (const key in params[param]) {
        let replaceKey = key;
        if (replaceKey.substring(0, 1) !== ':') {
          replaceKey = ':' + replaceKey; // in case we forgot the : for the key
        }
        retUrl = retUrl.replace(replaceKey, params[param][key]);
      }
    }

    if (withApp) {
      return app(retUrl);
    }
    return retUrl;
  }
}

// import { Urls } from '@/router/urls'
// all plain urls (except auth) must be prefixed with app, because thats the protected route in the server

const Urls = {
  Auth: {
    Login: anon('login'),
    Refresh: app('refresh'),
    UserData: app('user/user_data')
  },

  Users: {
    AllUsers: app('user/list'),
    GetUser: app('user/details'),
    EditUser: app('user/edit'),
    SetGroups: app('user/setgroups'),
    RegisterUser: app('user/register'),
    ChangePassword: app('user/change-password'),
    ResetPassword: anon('user/reset-password')
  },

  Accounts: {
    AllAccounts: app('stellar_account/accounts_list'),
    GetAccount: app('stellar_account/details'),
    AddAccount: app('stellar_account/add'),
    RemoveAccount: app('stellar_account/remove'),
    EditAccount: app('stellar_account/edit'),

    AddAssetCode: app('stellar_account/add_asset_code'),
    RemoveAssetCode: app('stellar_account/remove_asset_code'),

    AddAllowTrustSigner: app('stellar_account/add_allowtrust_signer'),
    RemoveAllowTrustSigner: app('stellar_account/remove_allowtrust_signer'),
    EditAllowTrustSigner: app('stellar_account/edit_allowtrust_signer'),
    AddOtherSigner: app('stellar_account/add_other_signer'),
    RemoveOtherSigner: app('stellar_account/remove_other_signer'),
    EditOtherSigner: app('stellar_account/edit_other_signer'),

    SearchTrustingAccounts: app('stellar_account/search_trusting_accounts'),
    SearchWorkerAccountTrustlines: app('stellar_account/worker_account_trustlines'),
    AddUnauthorizedTrustline: app('stellar_account/add_unauthorized_trustline'),
    RemoveUnauthorizedTrustline: app('stellar_account/remove_unauthorized_trustline'),
  },

  KnownCurrencies: {
    AllCurrencies: app('known_currencies/all'),
    GetCurrency: app('known_currencies/get'),
    AddCurrency: app('known_currencies/add'),
    EditCurrency: app('known_currencies/edit'),
    DeleteCurrency: app('known_currencies/delete'),
    ChangeCurrencyOrder: app('known_currencies/changeOrder'),
  },

  KnownInflationDestinations: {
    AllInflationDestinations: app('known_inflation_destinations/all'),
    GetInflationDestination: app('known_inflation_destinations/get'),
    AddInflationDestination: app('known_inflation_destinations/add'),
    EditInflationDestination: app('known_inflation_destinations/edit'),
    DeleteInflationDestination: app('known_inflation_destinations/delete'),
    ChangeInflationDestinationOrder: app('known_inflation_destinations/changeOrder'),
  },

  Tasks: {
    GetTaskStatus: new UrlReplacer('task/get_status/:id/')
  }
};

export default Urls;
