/* global __NODE_SCRIPT__ */
const nodeScript = __NODE_SCRIPT__;

export default {
  API_BASE: nodeScript === 'dev-local' ? 'http://localhost:9002' : 'https://demoapi.lumenshine.com',

  HORIZON_URL: 'https://demohorizon.lumenshine.com',
  IS_TEST_NETWORK: true,
};
