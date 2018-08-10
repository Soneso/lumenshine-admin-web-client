<template>
  <form>
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
        <tr v-if="data.type !== 'funding'">
          <th>Fund from account</th>
          <th>Funding amount</th>
          <th>{{ data.type === 'issuing' ? 'Asset code' : '' }}</th>
        </tr>
        <tr v-if="data.type !== 'funding'">
          <td>{{ foundingAccountText }}</td>
          <td>{{ data.fundingAmount }} XLM</td>
          <td>{{ data.type === 'issuing' ? data.assetCode : '' }}</td>
        </tr>
        <tr v-if="data.type === 'worker'">
          <th>Trust issuing account</th>
          <th>Trust asset code</th>
          <th/>
        </tr>
        <tr v-if="data.type === 'worker'">
          <td>{{ issuingAccountText }}</td>
          <td>{{ data.issuerAssetCode }}</td>
          <td/>
        </tr>
      </tbody>
    </table>
    <div>Public key: {{ keyPair.publicKey }}</div>
    <div>Secret seed: {{ keyPair.privateKey }}</div>
    <v-btn @click="onPrintClick">Print</v-btn>
    <div v-if="errors.length > 0" class="errors">
      <div v-for="error in errors" :key="error.error_message">{{ error.error_message }}</div>
    </div>
    <v-checkbox
      v-if="step === 'WRITE_DOWN'"
      v-model="writtenDownCheckbox"
      :error-messages="writtenDownErrors"
      label="I confirm that I have written down or printed the public key and secret seed of the account."
      @input="$v.writtenDownCheckbox.$touch()"
      @blur="$v.writtenDownCheckbox.$touch()"
    />
    <v-checkbox
      v-if="step === 'WRITE_DOWN'"
      v-model="secretNotStoredCheckbox"
      :error-messages="secretNotStoredErrors"
      label="I am aware of the fact that the secret seed is not stored in the portal."
      @input="$v.secretNotStoredCheckbox.$touch()"
      @blur="$v.secretNotStoredCheckbox.$touch()"
    />
    <div v-if="step === 'ENTER_PRIVATE_KEY'">
      <div>To be able to fund the new issuing account we need the secret seed of the funding account<br>Please enter the secret seed of the funding account here: </div>
      <v-text-field
        v-model="secret"
        :error-messages="secretErrors"
        @input="$v.secret.$touch"
        @blur="$v.secret.$touch"
      />
    </div>
    <v-btn v-if="step === 'WRITE_DOWN'" @click="onNextClick">Next</v-btn>
    <v-btn v-if="step === 'ENTER_PRIVATE_KEY'" @click="onCreateAccountClick">Create</v-btn>
    <v-btn @click="onBackClick">Back</v-btn>
    <v-btn @click="onCancelClick">Cancel</v-btn>
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
    keyPair: {
      type: Object,
      required: true
    },
    errors: {
      type: Array,
      default: () => []
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
    }
  },
  methods: {
    onCreateAccountClick () {
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }
      this.$emit('submit', this.secret);
      this.secret = '';
    },
    onBackClick () {
      this.$emit('back');
    },
    onCancelClick () {
      this.$emit('cancel');
    },
    onNextClick () {
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }
      if (this.data.type === 'funding') {
        return this.onCreateAccountClick();
      }
      this.step = 'ENTER_PRIVATE_KEY';
      this.$v.$reset();
    },
    onPrintClick () {
      window.print();
    }
  }
};
</script>

<style lang="scss" scoped>
table {
  width: 100%;
  text-align: center;
  margin-bottom: 25px;
}
.errors {
  color: red;
}
</style>
