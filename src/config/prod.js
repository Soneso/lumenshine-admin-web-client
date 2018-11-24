/* global __NODE_SCRIPT__ */
const nodeScript = __NODE_SCRIPT__;

export default {
  API_BASE: nodeScript === 'dev-local' ? 'http://localhost:9002' : 'https://api.lumenshine.com',

  HORIZON_URL: 'https://alphahorizon.lumenshine.com',
  IS_TEST_NETWORK: false,
};
