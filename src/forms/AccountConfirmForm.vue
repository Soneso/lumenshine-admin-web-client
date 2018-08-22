<template>
  <form>
    <div v-if="success" class="success-text title">
      <v-icon color="success" x-large>check_circle</v-icon>
      <v-spacer/>
      Account successfully added.
    </div>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <!-- <th>Network</th> -->
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{{ data.name }}</td>
          <td>{{ data.type }}</td>
          <!-- <td>{{ data.network }}</td> -->
          <td>{{ data.description }}</td>
        </tr>
      </tbody>
    </table>
    <table v-if="data.type !== 'funding'">
      <thead>
        <tr>
          <th>Fund from account</th>
          <th>Funding amount</th>
          <th>{{ data.type === 'issuing' ? 'Asset code' : '' }}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{{ foundingAccountText }}</td>
          <td>{{ data.fundingAmount }} XLM</td>
          <td>{{ data.type === 'issuing' ? data.assetCode : '' }}</td>
        </tr>
      </tbody>
    </table>
    <table v-if="data.type === 'worker'">
      <thead>
        <tr>
          <th>Trust issuing account</th>
          <th>Trust asset code</th>
          <th/>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{{ issuingAccountText }}</td>
          <td>{{ data.issuerAssetCode }}</td>
          <td/>
        </tr>
      </tbody>
    </table>
    <v-btn class="button--print" @click="onPrintClick">Print</v-btn>
    <div>
      <strong>Public key:</strong><br>
      {{ keyPair.publicKey }}
    </div>
    <br>
    <div v-if="!success && step !== 'ENTER_PRIVATE_KEY'">
      <strong class="important">Secret seed:</strong>
      <br>
      {{ keyPair.privateKey }}
    </div>
    <div v-if="success">
      <strong>Balance</strong>
      <br>
      <span :class="{ important: newAccount.balances === undefined }">{{ newAccount.balances !== undefined ? formatBalances(newAccount).join(', ') : '(not funded)' }}</span>
    </div>
    <div v-if="success && newAccount.balances === undefined">To fund this account, please manually transfer lumens (XLM) to the accounts public key.</div>
    <br>
    <div v-if="errors.length > 0" class="errors">
      <div v-for="error in errors" :key="error.error_message">{{ error.error_message }}</div>
    </div>
    <v-checkbox
      v-if="!success && step === 'WRITE_DOWN'"
      v-model="writtenDownCheckbox"
      :error-messages="writtenDownErrors"
      label="I confirm that I have written down or printed the public key and secret seed of the account."
      @input="$v.writtenDownCheckbox.$touch()"
      @blur="$v.writtenDownCheckbox.$touch()"
    />
    <v-checkbox
      v-if="!success && step === 'WRITE_DOWN'"
      v-model="secretNotStoredCheckbox"
      :error-messages="secretNotStoredErrors"
      label="I am aware of the fact that the secret seed is not stored in the portal."
      @input="$v.secretNotStoredCheckbox.$touch()"
      @blur="$v.secretNotStoredCheckbox.$touch()"
    />
    <div v-if="step === 'ENTER_PRIVATE_KEY' && !loading && !success">
      <div>To be able to fund the new issuing account we need you to sign the transaction with a signer of the <strong class="important">funding</strong> account. Please enter the signer and enter it's seed below: </div>
      <br>
      <v-select
        :items="signerItems"
        v-model="signer"
        label="Sign transaction with signer"
      />
      <v-text-field
        v-model="secret"
        :error-messages="secretErrors"
        label="Transaction signer's seed"
        @input="$v.secret.$touch"
        @blur="$v.secret.$touch"
      />
      <br>
    </div>
    <div v-if="!success">
      <v-btn v-if="step === 'WRITE_DOWN'" color="okay" @click="onCreateClick">Create</v-btn>
      <v-btn v-if="step === 'ENTER_PRIVATE_KEY'" color="okay" @click="onFinalizeClick">Create</v-btn>
      <v-btn color="info" @click="onBackClick">Back</v-btn>
      <v-btn @click="onCancelClick">Cancel</v-btn>
    </div>
    <div v-if="success">
      <v-btn @click="onDoneClick">Done</v-btn>
      <v-btn @click="onEditClick">Edit account</v-btn>
    </div>
  </form>
</template>

<script>
import { validationMixin } from 'vuelidate';
import { required } from 'vuelidate/lib/validators';

import { secretSeed as validSecretSeed } from '@/util/validators';

export default {
  name: 'AccountConfirmForm',
  mixins: [ validationMixin ],
  props: {
    data: {
      type: Object,
      required: true
    },
    loading: {
      type: Boolean,
      required: true,
    },
    keyPair: {
      type: Object,
      required: true
    },
    errors: {
      type: Array,
      default: () => []
    },
    success: {
      type: Boolean,
      required: true,
    },
    newAccount: {
      type: Object,
      default: () => null
    },
    fundingAccounts: {
      type: Array,
      default: () => []
    },
    issuingAccounts: {
      type: Array,
      default: () => []
    },
  },

  validations () {
    if (this.step === 'WRITE_DOWN') {
      return {
        writtenDownCheckbox: { required, checked: val => val === true },
        secretNotStoredCheckbox: { required, checked: val => val === true },
      };
    }
    return {
      secret: { required, validSecretSeed },
    };
  },

  data () {
    return {
      writtenDownCheckbox: false,
      secretNotStoredCheckbox: false,

      secret: '',
      signer: null,

      step: 'WRITE_DOWN'
    };
  },
  computed: {
    writtenDownErrors () {
      const errors = [];
      if (!this.$v.writtenDownCheckbox.$dirty) return errors;
      !this.$v.writtenDownCheckbox.checked && errors.push('Please check.');
      return errors;
    },
    secretNotStoredErrors () {
      const errors = [];
      if (!this.$v.secretNotStoredCheckbox.$dirty) return errors;
      !this.$v.secretNotStoredCheckbox.checked && errors.push('Please check.');
      return errors;
    },
    secretErrors () {
      const errors = [];
      if (this.step === 'WRITE_DOWN') return errors;
      if (!this.$v.secret.$dirty) return errors;
      !this.$v.secret.required && errors.push('Should not be empty.');
      !this.$v.secret.validSecretSeed && errors.push('Invalid secret.');
      return errors;
    },
    foundingAccountText () {
      if (!this.fundingAccounts || this.fundingAccounts.length === 0) return null;
      const acc = this.fundingAccounts.find(acc => acc.public_key === this.data.fundingAccount);
      return `${acc.name} (${acc.public_key.slice(0, 10)}...)`;
    },
    issuingAccountText () {
      if (!this.issuingAccounts || this.issuingAccounts.length === 0) return null;
      const acc = this.issuingAccounts.find(acc => acc.public_key === this.data.issuingAccount);
      return `${acc.name} (${acc.public_key.slice(0, 10)}...)`;
    },
    signerItems () {
      if (!this.fundingAccounts || this.fundingAccounts.length === 0) return [];
      const acc = this.fundingAccounts.find(acc => acc.public_key === this.data.fundingAccount);
      return acc.signers.map(signer => ({
        text: `${signer.public_key.slice(0, 16)}... weight ${signer.weight}`,
        value: signer.public_key,
      }));
    },
  },
  watch: {
    loading (val) {
      if (!val) {
        this.$v.$reset();
      }
    }
  },
  methods: {
    onFinalizeClick () {
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }
      this.$emit('submit', { secret: this.secret, signer: this.signer });
      this.secret = '';
    },
    onBackClick () {
      this.$emit('back');
    },
    onCancelClick () {
      this.$emit('cancel');
    },
    onCreateClick () {
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }
      if (this.data.type === 'funding') {
        return this.onFinalizeClick();
      }

      if (!this.fundingAccounts || this.fundingAccounts.length === 0) return;
      const acc = this.fundingAccounts.find(acc => acc.public_key === this.data.fundingAccount);
      if (acc.signers) {
        this.signer = acc.signers[0].public_key;
      }

      this.step = 'ENTER_PRIVATE_KEY';

      this.$v.$reset();
    },
    onPrintClick () {
      window.print();
    },
    onDoneClick () {
      this.$emit('cancel');
    },
    onEditClick () {
      this.$emit('edit');
    },
    formatBalances (account) {
      if (!account.balances) return [];
      const xlmBalance = `${account.balances.find(b => b.asset_type === 'native').balance} XLM`;

      const otherBalances = account.balances.filter(b => b.asset_type !== 'native');
      otherBalances.map(bal => `${bal.balance} ${bal.asset_code}`);
      return [xlmBalance, ...otherBalances.map(bal => `${bal.balance} ${bal.asset_code}`)];
    },
  }
};
</script>

<style lang="scss" scoped>
table {
  width: 100%;
  text-align: left;
  margin-bottom: 25px;
  table-layout: fixed;
}
.errors {
  color: red;
}
.important {
  color: #C22026;
}
.button--print {
  float: right;
}
.success-text {
  text-align: center;
  margin-bottom: 40px;
}
</style>
