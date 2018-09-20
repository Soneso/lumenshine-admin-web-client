<template>
  <v-flex xs12 sm12>
    <v-container v-if="showForm" row justify-space-between>
      <v-progress-linear v-if="loading" :indeterminate="true"/>
      <v-subheader class="headline">
        Add a new Stellar account
      </v-subheader>
      <div v-if="errorMessages.length > 0">
        <v-subheader v-for="error in errorMessages" :key="error.error_code" class="error">{{ error.error_message }}</v-subheader>
      </div>
      <account-add-form :data="formData" :funding-accounts="fundingAccounts" :issuing-accounts="issuingAccounts" @submit="submitForm"/>
    </v-container>
    <v-container v-if="!showForm" row justify-space-between>
      <v-subheader class="headline">
        Add a new Stellar account
      </v-subheader>
      <v-progress-linear v-if="loading" :indeterminate="true"/>
      <account-confirm-form
        :errors="errorMessages"
        :data="formData"
        :funding-accounts="fundingAccounts"
        :issuing-accounts="issuingAccounts"
        :key-pair="keyPair"
        :success="success"
        :new-account="newAccount"
        :loading="loading"
        @submit="onCreateAccountClick"
        @back="onBackClick"
        @cancel="onCancelClick"
        @edit="onEditClick" />
    </v-container>
  </v-flex>
</template>

<script>
import StellarSdk from 'stellar-sdk';

import { mapActions, mapGetters } from 'vuex';

import ApiUrls from '@/services/apiUrls';
import AccountAddForm from '@/forms/AccountAddForm';
import AccountConfirmForm from '@/forms/AccountConfirmForm';

const StellarAPI = new StellarSdk.Server(process.env.HORIZON_URL);
StellarSdk.Network.useTestNetwork();

export default {
  name: 'AddAccount',
  components: { AccountAddForm, AccountConfirmForm },
  data () {
    return {
      loading: false,

      showForm: true,
      formData: {},
      errorMessages: [],

      keyPair: null,

      success: false,
    };
  },
  computed: {
    ...mapGetters(['accountListStatus', 'accountList']),
    fundingAccounts () {
      if (!this.accountList) return [];
      return this.accountList.filter(acc => acc.type === 'funding');
    },
    issuingAccounts () {
      if (!this.accountList) return [];
      return this.accountList.filter(acc => acc.type === 'issuing');
    },
    newAccount () {
      if (!this.accountList || !this.keyPair.publicKey) return undefined;
      return this.accountList.find(acc => acc.public_key === this.keyPair.publicKey);
    }
  },
  watch: {
    async issuingAccounts (val) {
      for (const acc of val) {
        if (!acc.detailsLoaded) {
          await this.getAccountDetails(acc.public_key);
        }
      }
    }
  },
  created () {
    this.getAccountList();
  },
  methods: {
    ...mapActions(['getAccountList', 'getAccountDetails']),
    async submitForm (data) {
      this.errorMessages = [];
      this.showForm = false;
      this.success = false;
      const keyPair = StellarSdk.Keypair.random();
      this.keyPair = { publicKey: keyPair.publicKey(), privateKey: keyPair.secret() };
      this.formData = data;
    },
    async onCreateAccountClick ({secret = '', signer = null}) {
      this.errorMessages = [];
      this.loading = true;
      try {
        if (['issuing', 'worker'].includes(this.formData.type)) {
          await this.createStellarAccount(signer, this.keyPair.publicKey, this.formData.fundingAmount, secret);
        }
        if (this.formData.type === 'worker') {
          await this.createTrustline(this.formData.issuerAssetCode, this.formData.issuingAccount, this.keyPair.privateKey);
          // await this.demoTransfer(this.formData.issuerAssetCode, 'SDBOD6TOCM4ZWAB64EKTCIYENETLIHL5M4DNJP5VLTM3SYL5CRUBKGVB', this.keyPair.publicKey);
        }
        await this.$http({
          url: ApiUrls.Accounts.AddAccount,
          method: 'POST',
          data: {
            name: this.formData.name,
            description: this.formData.description,
            public_key: this.keyPair.publicKey,
            type: this.formData.type,
            ...(this.formData.type === 'issuing' ? {
              asset_code: this.formData.assetCode,
            } : {})
          }
        });

        const queries = [this.getAccountDetails(this.keyPair.publicKey)];

        if (this.formData.fundingAccount) {
          queries.push(this.getAccountDetails(this.formData.fundingAccount));
        }
        if (this.formData.issuingAccount) {
          queries.push(this.getAccountDetails(this.formData.issuingAccount));
        }

        await Promise.all(queries);
        this.success = true;
        // this.$router.push({ path: '/accounts' });
      } catch (err) {
        this.loading = false;
        console.error(err);
        if (err.response && err.response.data) {
          const data = err.response.data;
          if (data.extras && data.extras.result_codes && data.extras.result_codes.transaction) {
            const stellarError = data.extras.result_codes.transaction;
            if (stellarError === 'tx_bad_auth') {
              this.errorMessages = [{ error_message: 'Invalid secret seed.' }];
              return;
            } else if (stellarError === 'op_underfunded') {
              this.errorMessages = [{ error_message: 'Not enough funds in the funding account.' }];
              return;
            }
          }
        }
        this.errorMessages = [{ error_message: 'Cannot create account, try again later.' }];
      }
      this.loading = false;
    },
    onBackClick () {
      this.showForm = true;
    },
    onCancelClick () {
      this.$router.push({ path: '/accounts' });
    },
    onEditClick () {
      this.$router.push({ path: `/accounts/${this.newAccount.public_key}` });
    },
    async createStellarAccount (fromAccount, toAccount, amount, secret) {
      const sourceKeypair = StellarSdk.Keypair.fromSecret(secret);
      // const sourcePublicKey = sourceKeypair.publicKey();

      return StellarAPI.loadAccount(fromAccount)
        .then(account => {
          console.log('account', account);
          const transaction = new StellarSdk.TransactionBuilder(account)
            .addOperation(StellarSdk.Operation.createAccount({
              destination: toAccount,
              startingBalance: `${amount}`
            }))
            .build();

          transaction.sign(sourceKeypair);

          return StellarAPI.submitTransaction(transaction);
        });
    },
    async createTrustline (assetCode, issuer, workerSecret) {
      const sourceKeypair = StellarSdk.Keypair.fromSecret(workerSecret);
      const sourcePublicKey = sourceKeypair.publicKey();

      return StellarAPI.loadAccount(sourcePublicKey)
        .then(account => {
          const transaction = new StellarSdk.TransactionBuilder(account)
            .addOperation(StellarSdk.Operation.changeTrust({
              asset: new StellarSdk.Asset(assetCode, issuer),
            }))
            .build();

          transaction.sign(sourceKeypair);

          return StellarAPI.submitTransaction(transaction);
        });
    },
  }
};
</script>

<style lang="scss" scoped>
</style>
