// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import store from '@/store/store';
import router from '@/router';
import App from '@/App';
import { Urls } from '@/router/urls';
import Vuelidate from 'vuelidate';
import axios from 'axios';
import VueAxios from 'vue-axios';

import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';
// import 'material-design-icons-iconfont/dist/material-design-icons.css';
import 'babel-polyfill';

Vue.config.productionTip = false;
Vue.config.devtools = true;
Vue.config.debug = true;
Vue.router = router;

Vue.use(Vuelidate);
Vue.use(Vuetify);

// setup axios
axios.defaults.baseURL = process.env.AXIOS_BASE_URL;
Vue.use(VueAxios, axios);
Vue.http = axios;

// setup login
Vue.use(require('@websanova/vue-auth'), {
  // auth: require('@/router/bearer-auth.js'),
  auth: require('@websanova/vue-auth/drivers/auth/bearer.js'),
  http: require('@websanova/vue-auth/drivers/http/axios.1.x.js'),
  router: require('@websanova/vue-auth/drivers/router/vue-router.2.x.js'),
  fetchData: { url: Urls.Auth.UserData, method: 'GET', enabled: true },
  authRedirect: { path: '/login' },
  loginData: { url: Urls.Auth.Login, method: 'POST', redirect: '/', fetchUser: true },
  logoutData: { url: '/logout', method: 'POST', redirect: '/login', makeRequest: false },
  refreshData: { url: Urls.Auth.Refresh, method: 'GET', enabled: true, interval: 60 },
  rolesVar: 'groups'
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  components: { App },
  template: '<App/>'
});
