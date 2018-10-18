<template>
  <v-flex v-if="accountData" xs12 sm12>
    <v-container v-if="currentPage === 'details'">
      <v-progress-linear v-if="loadingDetails" :indeterminate="true"/>
      <v-subheader class="headline">
        Account details / Edit account
        <v-spacer/>
      </v-subheader>
      <div v-if="detailsErrorMessages.length > 0">
        <v-subheader v-for="error in detailsErrorMessages" :key="error.error_code" class="error">{{ error.error_message }}</v-subheader>
      </div>

      <div v-if="accountData" row justify-space-between>
        <account-details-form
          :data="accountData"
          :loading="loadingDetails || loadingStellar"
          @setName="setName"
          @setDescription="setDescription"
          @sendPayment="sendPayment"/>
      </div>

      <div v-if="accountData.type !== 'funding'">
        <br>
        <div v-if="accountData" row justify-space-between>
          <account-home-domain-form
            :data="accountData"
            :errors="stellarErrorMessages"
            :loading="loadingStellar"
            @setStellarData="setStellarData"/>
        </div>
      </div>

      <div v-if="accountData.type === 'issuing'">
        <br>
        <v-progress-linear v-if="loadingAssets" :indeterminate="true"/>
        <div v-if="assetsErrorMessages.length > 0">
          <v-subheader v-for="error in assetsErrorMessages" :key="error.error_code" class="error">{{ error.error_message }}</v-subheader>
        </div>
        <div v-if="accountData" row justify-space-between>
          <account-assets-form
            :data="accountData"
            :loading="loadingAssets || loadingStellar"
            @addAssetCode="addAssetCode"
            @deleteAssetCode="deleteAssetCode"
            @sendPayment="sendPayment"/>
        </div>
      </div>

      <div>
        <br>
        <v-progress-linear v-if="loadingDelete" :indeterminate="true"/>
        <div v-if="deleteErrorMessages.length > 0">
          <v-subheader v-for="error in deleteErrorMessages" :key="error.error_code" class="error">{{ error.error_message }}</v-subheader>
        </div>
        <div v-if="accountData" row justify-space-between>
          <v-btn class="error" @click="onDelete">Remove account</v-btn>
          <p>Hint: The account will be removed from the Admin Portal only. It will not be removed from the Stellar Network.</p>
          <!-- <v-btn @click="onPayment">Make a payment</v-btn> -->
        </div>
      </div>
    </v-container>

    <v-container v-if="currentPage === 'multisig'">
      <v-progress-linear v-if="loadingStellar || loadingSigners" :indeterminate="true"/>
      <v-subheader class="headline">
        Multi-Sig details / Edit Multi-Sig
        <v-spacer/>
      </v-subheader>
      <div v-if="signersErrorMessages.length > 0">
        <v-subheader v-for="error in signersErrorMessages" :key="error.error_code" class="error">{{ error.error_message }}</v-subheader>
      </div>
      <div v-if="accountData" row justify-space-between>
        <account-thresholds-form
          :data="accountData"
          :loading="loadingStellar"
          :errors="stellarErrorMessages"
          @setStellarData="setStellarData"/>
        <br>
        <account-signer-list
          :data="accountData"
          :errors="signersErrorMessages"
          :loading="loadingSigners"
          @addSigner="addSigner"
          @updateSigner="updateSigner"
          @removeSigner="deleteSigner"/>
      </div>
    </v-container>

    <v-container v-if="currentPage === 'trust'">
      <v-progress-linear v-if="loadingStellar" :indeterminate="true"/>
      <v-subheader class="headline">
        Trust details / Edit trust
        <v-spacer/>
      </v-subheader>
      <div v-if="signersErrorMessages.length > 0">
        <v-subheader v-for="error in signersErrorMessages" :key="error.error_code" class="error">{{ error.error_message }}</v-subheader>
      </div>
      <div v-if="accountData && !loadingStellar" row justify-space-between>
        <account-authorization-form
          v-if="accountData.type === 'issuing'"
          :data="accountData"
          :loading="loadingStellar"
          @setStellarData="setStellarData"/>
        <account-trustline-list
          :data="accountData"
          :issuing-accounts="issuingAccounts"
          :loading="loadingStellar"
          :errors="stellarErrorMessages"
          @authorizeTrustline="authorizeTrustline"
          @addTrustline="addTrustline"/>
      </div>
    </v-container>

    <br v-if="accountData.type !== 'funding'">

    <v-container v-if="accountData.type !== 'funding' && currentPage === 'stellar'">
      <v-progress-linear v-if="loadingStellar" :indeterminate="true"/>
      <v-subheader class="headline">
        Edit Stellar data
        <v-spacer/>
      </v-subheader>
      <div v-if="stellarErrorMessages.length > 0">
        <v-subheader v-for="error in stellarErrorMessages" :key="error.error_code" class="error">{{ error.error_message }}</v-subheader>
      </div>
      <div v-if="accountData" row justify-space-between>
        <account-stellar-form
          :data="accountData"
          @setStellarData="setStellarData"/>
      </div>
    </v-container>
  </v-flex>
</template>

<script>
import StellarSdk from 'stellar-sdk';
import ApiUrls from '@/services/apiUrls';
import config from '@/config';

import { mapActions, mapGetters } from 'vuex';

import AccountAssetsForm from '@/forms/accounts/AccountAssetsForm';
import AccountDetailsForm from '@/forms/accounts/AccountDetailsForm';
import AccountStellarForm from '@/forms/accounts/AccountStellarForm';
import AccountThresholdsForm from '@/forms/accounts/AccountThresholdsForm';
import AccountAuthorizationForm from '@/forms/accounts/AccountAuthorizationForm';
import AccountHomeDomainForm from '@/forms/accounts/AccountHomeDomainForm';

import AccountSignerList from '@/pages/accounts/AccountSignerList';
import AccountTrustlineList from '@/pages/accounts/AccountTrustlineList';

import StellarErrorHandler from '@/util/StellarErrorHelper';

const StellarAPI = new StellarSdk.Server(config.HORIZON_URL);
if (config.IS_TEST_NETWORK) {
  StellarSdk.Network.useTestNetwork();
} else {
  StellarSdk.Network.usePublicNetwork();
}

export default {
  name: 'EditAccount',
  components: { AccountStellarForm, AccountAssetsForm, AccountDetailsForm, AccountThresholdsForm, AccountAuthorizationForm, AccountHomeDomainForm, AccountTrustlineList, AccountSignerList },
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

      loadingTrustlines: false,
      trustlineErrorMessages: [],

      loadingDelete: false,
      deleteErrorMessages: [],
    };
  },
  computed: {
    ...mapGetters(['accountList']),
    accountData () {
      return this.$store.getters.account(this.$route.params.pk);
    },
    currentPage () {
      return this.$route.params.page || 'details';
    },
    issuingAccounts () {
      if (!this.accountList) return [];
      return this.accountList.filter(acc => acc.type === 'issuing');
    },
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
          url: ApiUrls.Accounts.EditAccount,
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
          url: ApiUrls.Accounts.EditAccount,
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

        if (sourcePublicKey !== data.publicKey) {
          this.loadingStellar = false;
          this.stellarErrorMessages = [{ error_code: 'NOT_MATCHING_SECRET', error_message: 'Secret seed not matching with public key.' }];
          return;
        } else if (!this.accountData.signers.find(signer => signer.public_key === sourcePublicKey)) {
          this.loadingStellar = false;
          this.stellarErrorMessages = [{ error_code: 'INVALID_SECRET', error_message: 'Invalid secret seed.' }];
          return;
        }

        const account = await StellarAPI.loadAccount(this.accountData.public_key);

        const setFlagsValue =
          (data.authRequired && !this.accountData.flags.auth_required ? 0x1 : 0) +
          (data.authRevocable && !this.accountData.flags.auth_revocable ? 0x2 : 0);

        const clearFlagsValue =
          (!data.authRequired && this.accountData.flags.auth_required ? 0x1 : 0) +
          (!data.authRevocable && this.accountData.flags.auth_revocable ? 0x2 : 0);

        const masterKey = data.masterKeyWeight !== undefined && this.accountData.signers.find(signer => signer.public_key === this.data.id);

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

            ...(data.masterKeyWeight !== undefined && masterKey && data.masterKeyWeight !== masterKey.weight ? {
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
        await this.getAccountDetails(this.accountData.public_key);
      } catch (err) {
        this.stellarErrorMessages = StellarErrorHandler(err);
      }
      this.loadingStellar = false;
    },

    async updateSigner (data) {
      this.loadingSigners = true;
      const updateStellar = !!data.secret;
      if (updateStellar) {
        try {
          const sourceKeypair = StellarSdk.Keypair.fromSecret(data.secret);
          const sourcePublicKey = sourceKeypair.publicKey();

          if (sourcePublicKey !== data.publicKey) {
            this.loadingStellar = false;
            this.stellarErrorMessages = [{ error_code: 'NOT_MATCHING_SECRET', error_message: 'Secret seed not matching with public key.' }];
            return;
          } else if (!this.accountData.signers.find(signer => signer.public_key === sourcePublicKey)) {
            this.loadingStellar = false;
            this.stellarErrorMessages = [{ error_code: 'INVALID_SECRET', error_message: 'Invalid secret seed.' }];
            return;
          }

          const account = await StellarAPI.loadAccount(this.accountData.public_key);

          const options = {
            ...(data.signerPublicKey === this.accountData.public_key ? {
              masterWeight: data.weight,
            } : {
              signer: {
                ed25519PublicKey: data.signerPublicKey,
                weight: data.weight,
              }
            }),
          };

          const transaction = new StellarSdk.TransactionBuilder(account)
            .addOperation(StellarSdk.Operation.setOptions(options))
            .build();

          transaction.sign(sourceKeypair);

          await StellarAPI.submitTransaction(transaction);
        } catch (err) {
          this.signersErrorMessages = StellarErrorHandler(err);
        }
      }
      if (data.name !== undefined || data.description !== undefined) {
        await this.$http({
          url: data.type === 'allow_trust' ? ApiUrls.Accounts.EditAllowTrustSigner : ApiUrls.Accounts.EditOtherSigner,
          method: 'POST',
          data: {
            name: data.name,
            description: data.description,
            public_key: data.signerPublicKey,
          }
        });
      }
      await this.getAccountDetails(this.accountData.public_key);
      this.loadingSigners = false;
    },

    async addAssetCode (data) {
      this.loadingAssets = true;
      this.assetsErrorMessages = [];
      try {
        await this.$http({
          url: ApiUrls.Accounts.AddAssetCode,
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
          url: ApiUrls.Accounts.RemoveAssetCode,
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

    async addSigner (data) {
      this.loadingSigners = true;
      this.signersErrorMessages = [];

      try {
        const sourceKeypair = StellarSdk.Keypair.fromSecret(data.secret);
        const sourcePublicKey = sourceKeypair.publicKey();

        if (sourcePublicKey !== data.publicKey) {
          this.loadingStellar = false;
          this.signersErrorMessages = [{ error_code: 'NOT_MATCHING_SECRET', error_message: 'Secret seed not matching with public key.' }];
          return;
        } else if (!this.accountData.signers.find(signer => signer.public_key === sourcePublicKey)) {
          this.loadingStellar = false;
          this.signersErrorMessages = [{ error_code: 'INVALID_SECRET', error_message: 'Invalid secret seed.' }];
          return;
        }

        let account = await StellarAPI.loadAccount(data.publicKey);

        if (data.shouldCreateWallet) {
          const transaction = new StellarSdk.TransactionBuilder(account)
            .addOperation(StellarSdk.Operation.createAccount({
              destination: data.signerPublicKey,
              startingBalance: '1.1',
            }))
            .build();

          transaction.sign(sourceKeypair);

          await StellarAPI.submitTransaction(transaction);
        }

        account = await StellarAPI.loadAccount(this.accountData.public_key);

        const transaction = new StellarSdk.TransactionBuilder(account)
          .addOperation(StellarSdk.Operation.setOptions({
            signer: {
              ed25519PublicKey: data.signerPublicKey,
              weight: data.weight,
            }
          }))
          .build();

        transaction.sign(sourceKeypair);

        await StellarAPI.submitTransaction(transaction);

        await this.$http({
          url: data.type === 'allow_trust' ? ApiUrls.Accounts.AddAllowTrustSigner : ApiUrls.Accounts.AddOtherSigner,
          method: 'POST',
          data: {
            account_public_key: this.accountData.public_key,
            issuing_account_public_key: this.accountData.public_key,
            signer_name: data.name,
            signer_description: data.description,
            signer_public_key: data.signerPublicKey,
            signer_secret_seed: data.signerSecret,
          }
        });
        await this.getAccountDetails(this.accountData.public_key);
      } catch (err) {
        this.signersErrorMessages = StellarErrorHandler(err);
      }
      this.loadingSigners = false;
    },

    async deleteSigner (data) {
      this.loadingSigners = true;
      this.signersErrorMessages = [];
      try {
        const sourceKeypair = StellarSdk.Keypair.fromSecret(data.secret);
        const sourcePublicKey = sourceKeypair.publicKey();

        if (sourcePublicKey !== data.publicKey) {
          this.loadingStellar = false;
          this.stellarErrorMessages = [{ error_code: 'NOT_MATCHING_SECRET', error_message: 'Secret seed not matching with public key.' }];
          return;
        } else if (!this.accountData.signers.find(signer => signer.public_key === sourcePublicKey)) {
          this.loadingStellar = false;
          this.stellarErrorMessages = [{ error_code: 'INVALID_SECRET', error_message: 'Invalid secret seed.' }];
          return;
        }

        const account = await StellarAPI.loadAccount(this.accountData.public_key);

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
          url: data.type === 'allow_trust' ? ApiUrls.Accounts.RemoveAllowTrustSigner : ApiUrls.Accounts.RemoveOtherSigner,
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

    async authorizeTrustline (data) {
      this.loadingTrustlines = true;
      this.signersErrorMessages = [];
      try {
        const sourceKeypair = StellarSdk.Keypair.fromSecret(data.secret);
        const sourcePublicKey = sourceKeypair.publicKey();

        if (sourcePublicKey !== data.publicKey) {
          this.loadingStellar = false;
          this.stellarErrorMessages = [{ error_code: 'NOT_MATCHING_SECRET', error_message: 'Secret seed not matching with public key.' }];
          return;
        } else if (!this.accountData.signers.find(signer => signer.public_key === sourcePublicKey)) {
          this.loadingStellar = false;
          this.stellarErrorMessages = [{ error_code: 'INVALID_SECRET', error_message: 'Invalid secret seed.' }];
          return;
        }

        const account = await StellarAPI.loadAccount(this.accountData.public_key);

        const transaction = new StellarSdk.TransactionBuilder(account)
          .addOperation(StellarSdk.Operation.allowTrust({
            trustor: data.trustlinePublicKey,
            assetCode: 'XLM',
            authorize: data.type === 'authorize',
            source: data.public_key,
          }))
          .build();

        transaction.sign(sourceKeypair);

        await StellarAPI.submitTransaction(transaction);
        await this.getAccountDetails(this.accountData.public_key);
      } catch (err) {
        this.loadingTrustlines = false;
        console.error(err);
        this.trustlineErrorMessages = [{ error_message: 'Cannot authorize trustline, try again later.' }];
      }
      this.loadingTrustlines = false;
    },

    onDelete () {
      this.$root.$confirm('Delete', 'Are you sure you want to delete the account?', { color: 'red', action: 'Delete' }).then(async confirm => {
        if (confirm) {
          this.loadingDelete = true;
          this.deleteErrorMessages = [];
          try {
            await this.$http({
              url: ApiUrls.Accounts.RemoveAccount,
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

    async addTrustline (data) {
      this.loadingStellar = true;

      const sourceKeypair = StellarSdk.Keypair.fromSecret(data.secret);
      const sourcePublicKey = sourceKeypair.publicKey();

      if (sourcePublicKey !== data.publicKey) {
        this.loadingStellar = false;
        this.stellarErrorMessages = [{ error_code: 'NOT_MATCHING_SECRET', error_message: 'Secret seed not matching with public key.' }];
        return;
      } else if (!this.accountData.signers.find(signer => signer.public_key === sourcePublicKey)) {
        this.loadingStellar = false;
        this.stellarErrorMessages = [{ error_code: 'INVALID_SECRET', error_message: 'Invalid secret seed.' }];
        return;
      }

      const account = await StellarAPI.loadAccount(data.publicKey);

      const asset = new StellarSdk.Asset(data.assetCode, data.issuerPublicKey);

      let transaction = new StellarSdk.TransactionBuilder(account)
        .addOperation(StellarSdk.Operation.changeTrust({
          asset,
          source: this.accountData.public_key
        }));

      transaction = transaction.build();

      transaction.sign(sourceKeypair);

      await StellarAPI.submitTransaction(transaction);
      await this.getAccountDetails(this.accountData.public_key);

      this.loadingStellar = false;
    },

    async sendPayment (data) {
      this.loadingStellar = true;

      const sourceKeypair = StellarSdk.Keypair.fromSecret(data.secret);
      const sourcePublicKey = sourceKeypair.publicKey();

      if (sourcePublicKey !== data.publicKey) {
        this.loadingStellar = false;
        this.stellarErrorMessages = [{ error_code: 'NOT_MATCHING_SECRET', error_message: 'Secret seed not matching with public key.' }];
        return;
      } else if (!this.accountData.signers.find(signer => signer.public_key === sourcePublicKey)) {
        this.loadingStellar = false;
        this.stellarErrorMessages = [{ error_code: 'INVALID_SECRET', error_message: 'Invalid secret seed.' }];
        return;
      }

      let memo;
      if (data.memoText !== '') {
        switch (data.memoType) {
          case 'MEMO_TEXT':
            memo = { memo: StellarSdk.Memo.text(data.memoText) };
            break;
          case 'MEMO_ID':
            memo = { memo: StellarSdk.Memo.id(data.memoText) };
            break;
          case 'MEMO_HASH':
            memo = { memo: StellarSdk.Memo.hash(data.memoText) };
            break;
          case 'MEMO_RETURN':
            memo = { memo: StellarSdk.Memo.returnHash(data.memoText) };
            break;
        }
      }

      const account = await StellarAPI.loadAccount(data.publicKey);

      const asset = data.assetCode === 'XLM' ? StellarSdk.Asset.native() : new StellarSdk.Asset(data.assetCode, sourcePublicKey);
      let transaction = new StellarSdk.TransactionBuilder(account, memo)
        .addOperation(StellarSdk.Operation.payment({
          destination: data.destPublicKey,
          asset,
          amount: data.amount
        }));

      transaction = transaction.build();

      transaction.sign(sourceKeypair);

      await StellarAPI.submitTransaction(transaction);
      await this.getAccountDetails(this.accountData.public_key);
      this.loadingStellar = false;
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
