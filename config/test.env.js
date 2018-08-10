'use strict';
const merge = require('webpack-merge');
const devEnv = require('./dev.env');

module.exports = merge(devEnv, {
  NODE_ENV: '"testing"',
  AXIOS_BASE_URL: '"http://api.stellargate.net"',
  HORIZON_URL: '"https://horizon-testnet.stellar.org"'
});
