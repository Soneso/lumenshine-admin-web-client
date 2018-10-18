<template>
  <form>
    <v-layout row>
      <v-text-field
        v-model="name"
        :error-messages="nameErrors"
        label="Name"
        required
        @input="$v.name.$touch()"
        @blur="$v.name.$touch()"
      />

      <v-spacer/>

      <v-select
        :items="typeItems"
        v-model="type"
        label="Type"
      />
    </v-layout>

    <!-- <v-select
      :items="networkItems"
      v-model="network"
      label="Network"
    /> -->

    <v-textarea
      v-model="description"
      :error-messages="descriptionErrors"
      label="Description"
      required
      rows="1"
      auto-grow
      @input="$v.description.$touch()"
      @blur="$v.description.$touch()"
    />

    <v-layout v-if="type !== 'funding'" row>
      <v-select
        :items="fundingAccountItems"
        v-model="fundingAccount"
        label="Fund from account"
      />

      <v-spacer/>

      <v-text-field
        v-model="fundingAmount"
        :error-messages="fundingAmountErrors"
        label="Funding amount (XLM)"
        required
        @input="$v.fundingAmount.$touch()"
        @blur="$v.fundingAmount.$touch()"
      />
    </v-layout>

    <v-flex sm6>
      <v-text-field
        v-if="type === 'issuing'"
        v-model="assetCode"
        :error-messages="assetCodeErrors"
        label="Asset code"
        required
        @input="$v.assetCode.$touch()"
        @blur="$v.assetCode.$touch()"
      />
    </v-flex>

    <v-layout v-if="type === 'worker'" row>
      <v-select
        :items="issuingAccountItems"
        v-model="issuingAccount"
        label="Trust issuing account"
      />

      <v-spacer/>

      <v-select
        :items="issuerAssetCodes"
        v-model="issuerAssetCode"
        label="Trust asset code"
      />
    </v-layout>

    <br>
    <v-btn color="okay" @click="submitForm">Create</v-btn>
  </form>
</template>

<script>
import { validationMixin } from 'vuelidate';
import { required, maxLength, decimal } from 'vuelidate/lib/validators';

import { assetCode as validAssetCode } from '@/util/validators';

export default {
  name: 'AccountAddForm',
  mixins: [validationMixin],
  props: {
    data: {
      type: Object,
      default: () => ({})
    },
    fundingAccounts: {
      type: Array,
      default: () => []
    },
    issuingAccounts: {
      type: Array,
      default: () => []
    },
    errors: {
      type: Array,
      default: () => []
    },
  },

  validations () {
    const base = {
      name: { required, maxLength: maxLength(256) },
      description: { required },
    };

    const issuing = {
      fundingAmount: {
        required,
        decimal,
        min: val => isNaN(parseFloat(val)) || parseFloat(val) >= 1.1,
        max: val => parseFloat(val) <= parseFloat(this.currentFundingAccountBalance) + 0.0000001 * 100,
      },
      assetCode: {
        required,
        valid: val => validAssetCode
      }
    };

    const working = {
      fundingAmount: {
        required,
        decimal,
        min: val => isNaN(parseFloat(val)) || parseFloat(val) >= 1.6,
        max: val => parseFloat(val) <= parseFloat(this.currentFundingAccountBalance) + 0.0000001 * 100,
      }
    };

    if (this.type === 'funding') {
      return base;
    } else if (this.type === 'issuing') {
      return {
        ...base,
        ...issuing
      };
    }

    return {
      ...base,
      ...working
    };
  },

  data () {
    return {
      name: this.data.name || '',
      type: this.data.type || 'funding',
      // network: this.data.network || 'live',
      description: this.data.description || '',
      fundingAccount: this.data.fundingAccount || null,
      fundingAmount: this.data.fundingAmount || '1.1',
      assetCode: this.data.assetCode || '',
      issuingAccount: this.data.issuingAccount || null,
      issuerAssetCode: this.data.issuerAssetCode || null,

      typeItems: [
        { text: 'Funding', value: 'funding' },
        { text: 'Issuing', value: 'issuing' },
        { text: 'Worker', value: 'worker' },
      ],

      // networkItems: [
      //   { text: 'live', value: 'live' },
      // ],
    };
  },
  computed: {
    nameErrors () {
      const errors = [];
      if (!this.$v.name.$dirty) return errors;
      !this.$v.name.required && errors.push('Name is required.');
      !this.$v.name.maxLength && errors.push('Max length for name is 256 characters.');
      return errors;
    },
    descriptionErrors () {
      const errors = [];
      if (!this.$v.description.$dirty) return errors;
      !this.$v.description.required && errors.push('Description is required.');
      return errors;
    },
    fundingAmountErrors () {
      const errors = [];
      if (!this.$v.fundingAmount.$dirty) return errors;
      !this.$v.fundingAmount.required && errors.push('Funding amount is required.');
      !this.$v.fundingAmount.decimal && errors.push('Funding amount should be numeric.');
      !this.$v.fundingAmount.min && errors.push(`Minimum ${this.type === 'issuing' ? 1.1 : 1.6} XLM are required to create ${this.type === 'issuing' ? 'an issuing' : 'a worker'} account`);
      !this.$v.fundingAmount.max && errors.push(`Insufficient funding, maximum ${this.currentFundingAccountBalance} XLM available in the selected funding account.`);
      return errors;
    },
    assetCodeErrors () {
      const errors = [];
      if (!this.$v.assetCode.$dirty) return errors;
      !this.$v.assetCode.required && errors.push('Asset code is required.');
      !this.$v.assetCode.valid && errors.push('Invalid asset code.');
      return errors;
    },
    fundingAccountItems () {
      return this.fundingAccounts.filter(acc => {
        if (this.type === 'issuing') {
          return acc.balances && acc.balances.find(bal => bal.asset_type === 'native' && bal.balance >= 1.10001) &&
            Math.max.apply(null, acc.signers.map(s => s.weight)) >= acc.thresholds.med_threshold;
        }
        if (this.type === 'worker') {
          return acc.balances && acc.balances.find(bal => bal.asset_type === 'native' && bal.balance >= 1.60001) &&
            Math.max.apply(null, acc.signers.map(s => s.weight)) >= acc.thresholds.med_threshold;
        }
        return false;
      }).sort((a, b) => {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
      }).map(acc => ({
        text: `${acc.name} (${acc.public_key.slice(0, 10)}...)`,
        value: acc.public_key,
      }));
    },
    issuingAccountItems () {
      return [...this.issuingAccounts].sort((a, b) => {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
      }).map(acc => ({
        text: `${acc.name} (${acc.public_key.slice(0, 10)}...)`,
        value: acc.public_key,
      }));
    },
    currentFundingAccountBalance () {
      if (this.fundingAccounts.length < 0 || this.fundingAccount === null) return 0;
      const acc = this.fundingAccounts.find(acc => acc.public_key === this.fundingAccount);
      return acc.balances.find(bal => bal.asset_type === 'native').balance;
    },
    issuerAssetCodes () {
      if (this.issuingAccounts.length < 0 || this.issuingAccount === null) return [];
      const acc = this.issuingAccounts.find(acc => acc.public_key === this.issuingAccount);
      if (!acc.asset_codes) return [];
      return acc.asset_codes.map(code => ({
        text: code,
        value: code,
      }));
    }
  },
  watch: {
    type (val) {
      if (val === 'worker') {
        this.fundingAmount = '1.6';
      }
      if (val === 'issuing') {
        this.fundingAmount = '1.1';
        this.issuerAssetCode = this.issuerAssetCodes[0].value;
      }
    },
    issuingAccount (val) {
      if (this.issuerAssetCodes.length > 0) {
        this.issuerAssetCode = this.issuerAssetCodes[0].value;
      }
    }
  },
  created () {
    if (this.fundingAccount === null && this.fundingAccountItems.length > 0) {
      this.fundingAccount = this.fundingAccountItems[0].value;
    }
    if (this.issuingAccount === null && this.issuingAccountItems.length > 0) {
      this.issuingAccount = this.issuingAccountItems[0].value;
    }
  },
  beforeUpdate () {
    if (this.fundingAccount === null && this.fundingAccountItems.length > 0) {
      this.fundingAccount = this.fundingAccountItems[0].value;
    }
    if (this.issuingAccount === null && this.issuingAccountItems.length > 0) {
      this.issuingAccount = this.issuingAccountItems[0].value;
    }
  },
  methods: {
    async submitForm () {
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }

      this.$emit('submit', {
        name: this.name,
        description: this.description,
        type: this.type,
        fundingAccount: this.fundingAccount,
        fundingAmount: this.fundingAmount,
        assetCode: this.assetCode,
        issuingAccount: this.issuingAccount,
        issuerAssetCode: this.issuerAssetCode,
      });
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
