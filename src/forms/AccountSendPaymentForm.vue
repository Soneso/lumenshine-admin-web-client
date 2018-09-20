<template>
  <form>
    <v-dialog v-model="showDialog" max-width="50%" @keydown.esc="showDialog = false">
      <v-toolbar color="primary" dark dense>
        <v-toolbar-title class="white--text">Send payment</v-toolbar-title>
      </v-toolbar>
      <v-card tile>
        <v-card-text>
          <v-progress-linear v-if="loading" :indeterminate="true"/>
          <table>
            <tr>
              <td><strong>Source account name</strong></td>
              <td>{{ data.name }}</td>
            </tr>
            <tr>
              <td><strong>Source account public key</strong></td>
              <td>
                {{ data.public_key }}
                <a
                  v-clipboard:copy="data.public_key"
                  v-clipboard:success="() => copiedAccount = data.public_key"
                  class="wallet-link">
                  <v-icon>file_copy</v-icon>
                </a>
                <span v-if="data.public_key === copiedAccount">Copied</span>
              </td>
            </tr>
            <tr>
              <td><strong>Send asset code</strong></td>
              <td>{{ assetCode }}</td>
            </tr>
            <tr/>
            <tr>
              <td><strong>Receiving account public key</strong></td>
              <td>
                <v-text-field
                  v-model="publicKey"
                  :error-messages="publicKeyErrors"
                  required
                  single-line
                  @input="$v.publicKey.$touch()"
                  @blur="$v.publicKey.$touch()"
                />
              </td>
            </tr>
            <tr>
              <td><strong>Amount to send</strong></td>
              <td>
                <v-text-field
                  v-model="amount"
                  :error-messages="amountErrors"
                  required
                  single-line
                  @input="$v.amount.$touch()"
                  @blur="$v.amount.$touch()"
                /> {{ assetCode }}
              </td>
            </tr>
            <tr>
              <td><strong>Memo (optional)</strong></td>
              <td>
                <v-select
                  :items="memoItems"
                  v-model="memoType"/>
                <br>
                <v-text-field
                  v-model="memoText"
                  :error-messages="memoTextErrors"
                  :placeholder="memoPlaceholder"
                  required
                  single-line
                  @input="$v.memoText.$touch()"
                  @blur="$v.memoText.$touch()"
                />
              </td>
            </tr>
            <tr/>
            <tr>
              <td><strong>Sign transaction with signer</strong></td>
              <td>
                <v-select
                  :items="signerItems"
                  v-model="signer"
                />
              </td>
            </tr>
            <tr>
              <td><strong>Transaction signer's seed</strong></td>
              <td>
                <v-text-field
                  v-model="secret"
                  :error-messages="secretErrors"
                  label="Account secret"
                  required
                  @input="$v.secret.$touch()"
                  @blur="$v.secret.$touch()"
                />
              </td>
            </tr>
          </table>
        </v-card-text>
        <v-card-actions>
          <div v-if="errors.length > 0">
            <v-subheader v-for="error in errors" :key="error.error_code" class="error">{{ error.error_message }}</v-subheader>
          </div>
          <v-spacer/>
          <v-btn color="primary darken-1" flat="flat" @click.native="sendPayment">Submit</v-btn>
          <v-btn color="primary darken-1" flat="flat" @click.native="reset">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </form>
</template>

<script>
import { validationMixin } from 'vuelidate';
import { required, numeric, maxLength } from 'vuelidate/lib/validators';

import { secretSeed as validSecretSeed, publicKey as validPublicKey } from '@/util/validators';

import EditorWidget from '@/components/EditorWidget';

export default {
  name: 'AccountSendPaymentForm',
  components: { EditorWidget },
  mixins: [validationMixin],
  props: {
    data: {
      type: Object,
      default: () => ({})
    },
    errors: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      required: true,
    },
    balance: {
      type: Object,
      default: () => ({})
    }
  },
  validations () {
    const base = {
      publicKey: { required, validPublicKey },
      amount: { required, numeric },
      secret: { required, validSecretSeed },
    };

    let memoValidators = {};
    switch (this.memoType) {
      case 'MEMO_TEXT':
        memoValidators = { ...memoValidators, maxLength: maxLength(28) };
        break;
      case 'MEMO_ID':
        memoValidators = { ...memoValidators, maxLength: maxLength(28) };
        break;
      case 'MEMO_HASH':
      case 'MEMO_RETURN':
        memoValidators = { ...memoValidators, validLength: val => val.length === 64 };
        break;
    }

    return { ...base, memoText: memoValidators };
  },
  data () {
    return {
      publicKey: '',
      amount: '',
      memoType: 'MEMO_TEXT',
      memoText: '',

      secret: '',
      signer: this.data && this.data.signers ? this.data.signers[0].public_key : null,

      showDialog: true,

      sendPending: false,

      copiedAccount: null,
    };
  },
  computed: {
    assetCode () {
      if (this.balance.asset_type === 'native') return 'XLM';
      return this.balance.asset_code;
    },

    memoPlaceholder () {
      switch (this.memoType) {
        case 'MEMO_TEXT':
          return 'Up to 28 characters';
        case 'MEMO_ID':
          return 'Enter memo ID number';
        case 'MEMO_HASH':
        case 'MEMO_RETURN':
          return 'Enter 64 characters encoded string';
      }
      return '';
    },

    memoItems () {
      return ['MEMO_TEXT', 'MEMO_ID', 'MEMO_HASH', 'MEMO_RETURN'].map(m => ({ text: m, value: m }));
    },

    memoTextErrors () {
      const errors = [];
      if (!this.$v.memoText.$dirty) return errors;
      !this.$v.memoText.maxLength && errors.push('Maximum length is 28 characters.');
      !this.$v.memoText.validLength && errors.push('Length should be exactly 64 characters.');
      return errors;
    },

    amountErrors () {
      const errors = [];
      if (!this.$v.amount.$dirty) return errors;
      !this.$v.amount.required && errors.push('Amount is required.');
      !this.$v.amount.numeric && errors.push('Amount should be numeric.');
    },

    publicKeyErrors () {
      const errors = [];
      if (!this.$v.publicKey.$dirty) return errors;
      !this.$v.publicKey.required && errors.push('Public key is required.');
      !this.$v.publicKey.validPublicKey && errors.push('Public key seed should be valid.');
      return errors;
    },

    secretErrors () {
      const errors = [];
      if (!this.$v.secret.$dirty) return errors;
      !this.$v.secret.required && errors.push('Secret is required.');
      !this.$v.secret.validSecretSeed && errors.push('Secret seed should be valid.');
      return errors;
    },

    signerItems () {
      if (!this.data || !this.data.signers) return [];
      const acc = this.data;
      return acc.signers.filter(signer => signer.weight >= this.data.thresholds.med_threshold).map(signer => ({
        text: `${signer.public_key.slice(0, 16)}... weight ${signer.weight}`,
        value: signer.public_key,
      }));
    },
  },
  watch: {
    loading (val) {
      if (!val && this.sendPending) {
        this.sendPending = false;
        if (this.errors.length === 0) {
          this.reset();
        }
      }
    }
  },
  methods: {
    reset () {
      this.homeDomain = this.data.home_domain || '';
      this.secret = '';
      this.showDialog = false;
      this.$v.$reset();
    },

    sendPayment () {
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }
      this.$emit('sendPayment', {
        destPublicKey: this.publicKey,
        amount: this.amount,
        memoType: this.memoType,
        memoText: this.memoText,
        assetCode: this.assetCode,
        secret: this.secret,
        publicKey: this.signer,
      });
      this.sendPending = true;
    },

    onCancel () {
      this.reset();
    },

    onSetClick () {
      if (this.signerItems.length === 0) {
        this.$root.$info('Error', 'No signer is available for sending payments.', { color: 'red' });
      } else {
        this.showDialog = true;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
table {
  width: 100%;
}
</style>
