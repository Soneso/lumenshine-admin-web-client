'use strict';
const merge = require('webpack-merge');
const prodEnv = require('./prod.env');

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  AXIOS_BASE_URL: '"https://demoapi.lumenshine.com"',
  HORIZON_URL: '"https://horizon-testnet.stellar.org"'
});
