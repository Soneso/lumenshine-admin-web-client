// import queryString from '../../node_modules/query-string';

function appPrefix (url) {
  return '/portal/admin/dash/' + url;
}

function anonPrefix (url) {
  return '/portal/admin/' + url;
}

function userPrefix (url) {
  return '/portal/user/' + url;
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
      return appPrefix(retUrl);
    }
    return retUrl;
  }
}

// import { Urls } from '@/router/urls'
// all plain urls (except auth) must be prefixed with app, because thats the protected route in the server

const Urls = {
  Data: {
    SalutationList: userPrefix('salutation_list'),
    CountryList: userPrefix('country_list'),
    OccupationList: userPrefix('occupation_list'),
    LanguageList: userPrefix('language_list'),
  },

  Auth: {
    Login: anonPrefix('login'),
    Refresh: appPrefix('refresh'),
    UserData: appPrefix('user/user_data')
  },

  Users: {
    AllUsers: appPrefix('user/list'),
    GetUser: appPrefix('user/details'),
    EditUser: appPrefix('user/edit'),
    SetGroups: appPrefix('user/setgroups'),
    RegisterUser: appPrefix('user/register'),
    ChangePassword: appPrefix('user/change-password'),
    ResetPassword: anonPrefix('user/reset-password')
  },

  Accounts: {
    AllAccounts: appPrefix('stellar_account/accounts_list'),
    GetAccount: appPrefix('stellar_account/details'),
    AddAccount: appPrefix('stellar_account/add'),
    RemoveAccount: appPrefix('stellar_account/remove'),
    EditAccount: appPrefix('stellar_account/edit'),

    AddAssetCode: appPrefix('stellar_account/add_asset_code'),
    RemoveAssetCode: appPrefix('stellar_account/remove_asset_code'),

    AddAllowTrustSigner: appPrefix('stellar_account/add_allowtrust_signer'),
    RemoveAllowTrustSigner: appPrefix('stellar_account/remove_allowtrust_signer'),
    EditAllowTrustSigner: appPrefix('stellar_account/edit_allowtrust_signer'),
    AddOtherSigner: appPrefix('stellar_account/add_other_signer'),
    RemoveOtherSigner: appPrefix('stellar_account/remove_other_signer'),
    EditOtherSigner: appPrefix('stellar_account/edit_other_signer'),

    SearchTrustingAccounts: appPrefix('stellar_account/search_trusting_accounts'),
    SearchWorkerAccountTrustlines: appPrefix('stellar_account/worker_account_trustlines'),
    AddUnauthorizedTrustline: appPrefix('stellar_account/add_unauthorized_trustline'),
    RemoveUnauthorizedTrustline: appPrefix('stellar_account/remove_unauthorized_trustline'),
  },

  Customers: {
    AllCustomers: appPrefix('customer/list'),
    GetCustomerDetails: appPrefix('customer/details'),
    GetCustomerOrders: appPrefix('customer/orders'),
    GetCustomerWallets: appPrefix('customer/wallets'),
    EditCustomer: appPrefix('customer/update_personal_data'),
    UpdateKYCStatus: appPrefix('customer/update_kyc_status'),
    Reset2FA: appPrefix('customer/reset2fa'),
  },

  KnownCurrencies: {
    AllCurrencies: appPrefix('known_currencies/all'),
    GetCurrency: appPrefix('known_currencies/get'),
    AddCurrency: appPrefix('known_currencies/add'),
    EditCurrency: appPrefix('known_currencies/edit'),
    DeleteCurrency: appPrefix('known_currencies/delete'),
    ChangeCurrencyOrder: appPrefix('known_currencies/changeOrder'),
  },

  KnownInflationDestinations: {
    AllInflationDestinations: appPrefix('known_inflation_destinations/all'),
    GetInflationDestination: appPrefix('known_inflation_destinations/get'),
    AddInflationDestination: appPrefix('known_inflation_destinations/add'),
    EditInflationDestination: appPrefix('known_inflation_destinations/edit'),
    DeleteInflationDestination: appPrefix('known_inflation_destinations/delete'),
    ChangeInflationDestinationOrder: appPrefix('known_inflation_destinations/changeOrder'),
  },

  Tasks: {
    GetTaskStatus: new UrlReplacer('task/get_status/:id/')
  }
};

export default Urls;
