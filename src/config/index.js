/* global __BUILD_CONFIG__ */

export default {
  APP_VERSION: '0.1.0',

  IS_DEV: process.env.NODE_ENV === 'development',

  ...((__BUILD_CONFIG__ === 'demo') ? require('./demo').default : require('./alpha').default),
};
