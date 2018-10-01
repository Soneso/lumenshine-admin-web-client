import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
  // mode: 'history',
  routes: [
    { path: '/login', component: require('@/pages/Login').default, name: 'Login', meta: { auth: false } },
    {
      path: '/',
      component: require('@/pages/Layout').default,
      name: 'home',
      meta: { auth: true },
      children: [
        { path: '/', component: require('@/pages/Home').default, name: 'Home' },

        { path: '/users', component: require('@/pages/users/UserList').default, name: 'UserList' },
        { path: '/users/add', component: require('@/pages/users/AddUser').default, name: 'AddUser' },
        { path: '/users/:id', component: require('@/pages/users/ViewUser').default, name: 'ViewUser' },
        { path: '/users/edit/:id', component: require('@/pages/users/EditUser').default, name: 'EditUser' },

        { path: '/myuser', component: require('@/pages/users/MyUser').default, name: 'MyUser' },

        { path: '/accounts', component: require('@/pages/accounts/AccountList').default, name: 'AccountList' },
        { path: '/accounts/add', component: require('@/pages/accounts/AddAccount').default, name: 'AddAccount' },
        { path: '/accounts/:pk/transactions', component: require('@/pages/accounts/AccountTransactionList').default, name: 'AccountTransactionList' },
        { path: '/accounts/:pk/:page?', component: require('@/pages/accounts/EditAccount').default, name: 'EditAccount' },

        { path: '/customers', component: require('@/pages/customers/CustomerList').default, name: 'CustomerList' },

        { path: '/known_currencies', component: require('@/pages/known_currencies/KnownCurrenciesList').default, name: 'KnownCurrenciesList' },
        { path: '/known_currencies/add', component: require('@/pages/known_currencies/AddKnownCurrency').default, name: 'AddKnownCurrency' },
        { path: '/known_currencies/:id', component: require('@/pages/known_currencies/EditKnownCurrency').default, name: 'EditKnownCurrency' },

        { path: '/known_inflation_destinations', component: require('@/pages/known_inflation_destinations/KnownInflationDestinationList').default, name: 'KnownInflationDestinationList' },
        { path: '/known_inflation_destinations/add', component: require('@/pages/known_inflation_destinations/AddKnownInflationDestination').default, name: 'AddKnownInflationDestination' },
        { path: '/known_inflation_destinations/:id', component: require('@/pages/known_inflation_destinations/EditKnownInflationDestination.').default, name: 'EditKnownInflationDestination.' },
      ]
    }
  ]
});
