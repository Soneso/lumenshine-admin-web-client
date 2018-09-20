import config from '@/config';

export default err => {
  config.IS_DEV && console.error(err);
  if (err.message === 'invalid checksum') { // cannot decode secret seed
    return [{ error_code: 'INVALID_SECRET', error_message: 'Invalid secret seed.' }];
  }

  if (err.response && err.response.data) {
    const data = err.response.data;
    if (data.extras && data.extras.result_codes && data.extras.result_codes.transaction) {
      const stellarError = data.extras.result_codes.transaction;
      if (stellarError === 'tx_bad_auth') {
        return [{ error_code: 'INVALID_SECRET', error_message: 'Invalid secret seed.' }];
      } else if (stellarError === 'op_underfunded') {
        return [{ error_code: 'NOT_ENOUGH_FUNDS', error_message: 'Not enough funds in the funding account.' }];
      }
    }
  }
  return [{ error_code: 'UNKNOWN_ERROR', error_message: 'Stellar transaction failed, try again later.' }];
};
