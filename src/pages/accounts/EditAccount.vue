<template>
  <v-flex v-if="accountData" xs12 sm12>
    <v-card>
      <v-progress-linear v-if="loadingDetails" :indeterminate="true"/>
      <v-card-title>
        Edit Account
        <v-spacer/>
      </v-card-title>
      <div v-if="detailsErrorMessages.length > 0">
        <v-subheader v-for="error in detailsErrorMessages" :key="error.error_code" class="error">{{ error.error_message }}</v-subheader>
      </div>
      <v-container v-if="accountData" row justify-space-between>
        <account-details-form
          :data="accountData"
          @setName="setName"
          @setDescription="setDescription"/>
      </v-container>
    </v-card>
    <br v-if="accountData.type === 'issuing'">
    <v-card v-if="accountData.type === 'issuing'">
      <v-progress-linear v-if="loadingAssets" :indeterminate="true"/>
      <div v-if="assetsErrorMessages.length > 0">
        <v-subheader v-for="error in assetsErrorMessages" :key="error.error_code" class="error">{{ error.error_message }}</v-subheader>
      </div>
      <v-container v-if="accountData" row justify-space-between>
        <account-assets-form
          :data="accountData"
          @addAssetCode="addAssetCode"
          @deleteAssetCode="deleteAssetCode"
        />
      </v-container>
    </v-card>
    <br v-if="accountData.type !== 'funding'">
    <v-card v-if="accountData.type !== 'funding'">
      <v-progress-linear v-if="loadingSigners" :indeterminate="true"/>
      <div v-if="signersErrorMessages.length > 0">
        <v-subheader v-for="error in signersErrorMessages" :key="error.error_code" class="error">{{ error.error_message }}</v-subheader>
      </div>
      <v-container v-if="accountData" row justify-space-between>
        <account-signers-form
          :data="accountData"
          @addAllowTrustSigner="data => addSigner(data, 'allowtrust')"
          @deleteAllowTrustSigner="data => deleteSigner(data, 'allowtrust')"
          @addOtherSigner="data => addSigner(data, 'other')"
          @deleteOtherSigner="data => deleteSigner(data, 'other')"
        />
      </v-container>
    </v-card>
    <br v-if="accountData.type !== 'funding'">
    <v-card v-if="accountData.type !== 'funding'">
      <v-progress-linear v-if="loadingStellar" :indeterminate="true"/>
      <v-card-title>
        Edit Stellar data
        <v-spacer/>
      </v-card-title>
      <div v-if="stellarErrorMessages.length > 0">
        <v-subheader v-for="error in stellarErrorMessages" :key="error.error_code" class="error">{{ error.error_message }}</v-subheader>
      </div>
      <v-container v-if="accountData" row justify-space-between>
        <account-stellar-form
          :data="accountData"
          @setStellarData="setStellarData"/>
      </v-container>
    </v-card>
    <br>
    <v-card>
      <v-progress-linear v-if="loadingDelete" :indeterminate="true"/>
      <div v-if="deleteErrorMessages.length > 0">
        <v-subheader v-for="error in deleteErrorMessages" :key="error.error_code" class="error">{{ error.error_message }}</v-subheader>
      </div>
      <v-container v-if="accountData" row justify-space-between>
        <v-btn @click="onDelete">Delete account</v-btn>
        <!-- <v-btn @click="onPayment">Make a payment</v-btn> -->
      </v-container>
    </v-card>
  </v-flex>
</template>

<script>
import StellarSdk from 'stellar-sdk';
import { Urls } from '@/router/urls';

import { mapActions, mapGetters } from 'vuex';

import AccountAssetsForm from '@/forms/AccountAssetsForm';
import AccountDetailsForm from '@/forms/AccountDetailsForm';
import AccountSignersForm from '@/forms/AccountSignersForm';
import AccountStellarForm from '@/forms/AccountStellarForm';

const StellarAPI = new StellarSdk.Server(process.env.HORIZON_URL);
StellarSdk.Network.useTestNetwork();

export default {
  name: 'EditAccount',
  components: { AccountStellarForm, AccountAssetsForm, AccountDetailsForm, AccountSignersForm },
  data () {
    return {
      loadingDetails: false,
      detailsErrorMessages: [],

      loadingAssets: false,
      assetsErrorMessages: [],

      loadingSigners: false,
      signersErrorMessages: [],

      loadingStellar: false,
      stellarErrorMessages: [],

      loadingDelete: false,
      deleteErrorMessages: [],
    };
  },
  computed: {
    ...mapGetters(['accountList']),
    accountData () {
      return this.$store.getters.account(this.$route.params.pk);
    }
  },
  async created () {
    this.getAccountDetails(this.$route.params.pk);
  },
  methods: {
    ...mapActions(['getAccountList', 'getAccountDetails']),

    async setName (data) {
      this.loadingDetails = true;
      this.detailsErrorMessages = [];
      try {
        await this.$http({
          url: Urls.Accounts.EditAccount,
          method: 'POST',
          data: {
            name: data.name,
            public_key: data.publicKey
          }
        });
        await this.getAccountDetails(data.publicKey);
      } catch (err) {
        this.loadingDetails = false;
        console.error(err);
        this.detailsErrorMessages = [{ error_message: 'Cannot update name, try again later.' }];
      }
      this.loadingDetails = false;
    },

    async setDescription (data) {
      this.loadingDetails = true;
      this.detailsErrorMessages = [];
      try {
        await this.$http({
          url: Urls.Accounts.EditAccount,
          method: 'POST',
          data: {
            description: data.description,
            public_key: data.publicKey
          }
        });
        await this.getAccountDetails(data.publicKey);
      } catch (err) {
        this.loadingDetails = false;
        console.error(err);
        this.detailsErrorMessages = [{ error_message: 'Cannot update name, try again later.' }];
      }
      this.loadingDetails = false;
    },

    async setStellarData (data) {
      this.loadingStellar = true;
      this.stellarErrorMessages = [];
      try {
        const sourceKeypair = StellarSdk.Keypair.fromSecret(data.secret);
        const sourcePublicKey = sourceKeypair.publicKey();

        const account = await StellarAPI.loadAccount(sourcePublicKey);

        const setFlagsValue =
          (data.authRequired && !this.accountData.flags.auth_required ? 0x1 : 0) +
          (data.authRevocable && !this.accountData.flags.auth_revocable ? 0x2 : 0);

        const clearFlagsValue =
          (!data.authRequired && this.accountData.flags.auth_required ? 0x1 : 0) +
          (!data.authRevocable && this.accountData.flags.auth_revocable ? 0x2 : 0);

        const masterKey = this.accountData.signers.find(signer => signer.public_key === this.data.id);

        const transaction = new StellarSdk.TransactionBuilder(account)
          .addOperation(StellarSdk.Operation.setOptions({
            ...(data.homeDomain !== this.accountData.home_domain ? {
              homeDomain: data.homeDomain,
            } : {}),

            ...(data.thresholdLow !== this.accountData.thresholds.low_threshold ? {
              lowThreshold: data.thresholdLow,
            } : {}),
            ...(data.thresholdMed !== this.accountData.thresholds.med_threshold ? {
              medThreshold: data.thresholdMed,
            } : {}),
            ...(data.thresholdHigh !== this.accountData.thresholds.high_threshold ? {
              highThreshold: data.thresholdHigh,
            } : {}),

            ...(masterKey && data.masterKeyWeight !== masterKey.weight ? {
              masterWeight: data.masterKeyWeight,
            } : {}),

            ...(setFlagsValue > 0 ? {
              setFlags: setFlagsValue,
            } : {}),

            ...(clearFlagsValue > 0 ? {
              clearFlags: clearFlagsValue,
            } : {}),
          }))
          .build();

        transaction.sign(sourceKeypair);

        await StellarAPI.submitTransaction(transaction);
        await this.getAccountDetails(data.publicKey);
      } catch (err) {
        this.loadingStellar = false;
        console.error(err);
        this.stellarErrorMessages = [{ error_message: 'Cannot update data, try again later.' }];
      }
      this.loadingStellar = false;
    },

    async addAssetCode (data) {
      this.loadingAssets = true;
      this.assetsErrorMessages = [];
      try {
        await this.$http({
          url: Urls.Accounts.AddAssetCode,
          method: 'POST',
          data: {
            public_key: data.publicKey,
            asset_code: data.assetCode,
          }
        });
        await this.getAccountDetails(data.publicKey);
      } catch (err) {
        this.loadingAssets = false;
        console.error(err);
        this.assetsErrorMessages = [{ error_message: 'Cannot add asset code, try again later.' }];
      }
      this.loadingAssets = false;
    },

    async deleteAssetCode (data) {
      this.loadingAssets = true;
      this.assetsErrorMessages = [];
      try {
        await this.$http({
          url: Urls.Accounts.RemoveAssetCode,
          method: 'POST',
          data: {
            public_key: data.publicKey,
            asset_code: data.assetCode,
          }
        });
        await this.getAccountDetails(data.publicKey);
      } catch (err) {
        this.loadingAssets = false;
        console.error(err);
        this.assetsErrorMessages = [{ error_message: 'Cannot delete asset code, try again later.' }];
      }
      this.loadingAssets = false;
    },

    async addSigner (data, type) {
      this.loadingSigners = true;
      this.signersErrorMessages = [];
      try {
        const sourceKeypair = StellarSdk.Keypair.fromSecret(data.issuingSecret);
        const sourcePublicKey = sourceKeypair.publicKey();

        const account = await StellarAPI.loadAccount(sourcePublicKey);

        const transaction = new StellarSdk.TransactionBuilder(account)
          .addOperation(StellarSdk.Operation.setOptions({
            signer: {
              ed25519PublicKey: data.publicKey,
              weight: data.weight,
            }
          }))
          .build();

        transaction.sign(sourceKeypair);

        await StellarAPI.submitTransaction(transaction);
        await this.$http({
          url: type === 'allowtrust' ? Urls.Accounts.AddAllowTrustSigner : Urls.Accounts.AddOtherSigner,
          method: 'POST',
          data: {
            account_public_key: this.accountData.public_key,
            signer_name: data.name,
            signer_description: data.description,
            signer_public_key: data.publicKey,
            signer_secret_seed: data.secret,
          }
        });
        await this.getAccountDetails(this.accountData.public_key);
      } catch (err) {
        this.loadingSigners = false;
        console.error(err);
        this.signersErrorMessages = [{ error_message: 'Cannot add signer, try again later.' }];
      }
      this.loadingSigners = false;
    },

    async deleteSigner (data, type) {
      this.loadingSigners = true;
      this.signersErrorMessages = [];
      try {
        const sourceKeypair = StellarSdk.Keypair.fromSecret(data.issuingSecret);
        const sourcePublicKey = sourceKeypair.publicKey();

        const account = await StellarAPI.loadAccount(sourcePublicKey);

        const transaction = new StellarSdk.TransactionBuilder(account)
          .addOperation(StellarSdk.Operation.setOptions({
            signer: {
              ed25519PublicKey: data.publicKey,
              weight: 0,
            }
          }))
          .build();

        transaction.sign(sourceKeypair);

        await StellarAPI.submitTransaction(transaction);
        await this.$http({
          url: type === 'allowtrust' ? Urls.Accounts.RemoveAllowTrustSigner : Urls.Accounts.RemoveOtherSigner,
          method: 'POST',
          data: {
            account_public_key: this.accountData.public_key,
            signer_public_key: data.publicKey,
          }
        });
        await this.getAccountDetails(this.accountData.public_key);
      } catch (err) {
        this.loadingSigners = false;
        console.error(err);
        this.signersErrorMessages = [{ error_message: 'Cannot delete signer, try again later.' }];
      }
      this.loadingSigners = false;
    },

    onDelete () {
      this.$root.$confirm('Delete', 'Are you sure you want to delete the account?', { color: 'red' }).then(async confirm => {
        if (confirm) {
          this.loadingDelete = true;
          this.deleteErrorMessages = [];
          try {
            await this.$http({
              url: Urls.Accounts.RemoveAccount,
              method: 'POST',
              data: {
                public_key: this.accountData.public_key,
              }
            });
            await this.getAccountList();
          } catch (err) {
            this.loadingDelete = false;
            console.error(err);
            this.deleteErrorMessages = [{ error_message: 'Cannot delete account, try again later.' }];
          }
          this.loadingDelete = false;
          this.$router.push({ path: '/accounts' });
        }
      });
    },

    onPayment () {

    }
  }
};
</script>

<style lang="scss" scoped>
</style>
