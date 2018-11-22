/* global __NODE_SCRIPT__ */
const nodeScript = __NODE_SCRIPT__;

export default {
  API_BASE: nodeScript === 'dev-local' ? 'http://localhost:9002' : 'https://lsstageapi.ponytest.de',

  HORIZON_URL: 'https://lsstagehorizon.ponytest.de',
  IS_TEST_NETWORK: false,
};
