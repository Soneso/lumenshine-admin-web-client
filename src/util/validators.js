export function publicKey (value) {
  return /^[0-9A-Z]{56}$/.test(value);
};

export function secretSeed (value) {
  return /^[0-9A-Z]{56}$/.test(value);
};

export function assetCode (value) {
  return /^[a-zA-Z0-9]{1,12}$/.test(value);
};

export function domain (value) {
  return value === '' || /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(value);
};
