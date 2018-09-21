<template>
  <form>
    <v-dialog v-model="showDialog" max-width="50%" @keydown.esc="showDialog = false">
      <v-toolbar color="primary" dark dense>
        <v-toolbar-title class="white--text">Add signer</v-toolbar-title>
      </v-toolbar>
      <v-card tile>
        <v-card-text>
          <v-progress-linear v-if="loading" :indeterminate="true"/>
          <table>
            <tr>
              <td><strong>Account public key</strong></td>
              <td>{{ data.public_key }}</td>
            </tr>
            <tr>
              <td><strong>Account thresholds</strong></td>
              <td>low threshold: {{ data.thresholds.low_threshold }}, medium threshold: {{ data.thresholds.med_threshold }}, high threshold: {{ data.thresholds.high_threshold }}</td>
            </tr>
            <tr>
              <td><strong>New Signer name</strong></td>
              <td>
                <v-text-field
                  v-model="name"
                  :error-messages="nameErrors"
                  required
                  single-line
                  @input="$v.name.$touch()"
                  @blur="$v.name.$touch()"
                />
              </td>
            </tr>
            <tr>
              <td><strong>New Signer description</strong></td>
              <td>
                <v-text-field
                  v-model="description"
                  required
                  single-line
                />
              </td>
            </tr>
            <tr>
              <td><strong>New Signer type</strong></td>
              <td>
                <v-select
                  :items="typeItems"
                  v-model="selectedType"
                />
              </td>
            </tr>
            <tr>
              <td><strong>New Signer public key</strong></td>
              <td>
                <v-layout row>
                  {{ hasGenerated ? signerPublicKey : null }}
                  <v-text-field
                    v-if="!hasGenerated"
                    v-model="signerPublicKey"
                    :error-messages="signerPublicKeyErrors"
                    required
                    single-line
                    @input="$v.signerPublicKey.$touch()"
                    @blur="$v.signerPublicKey.$touch()"
                  />
                  <a
                    v-clipboard:copy="signerPublicKey"
                    v-clipboard:success="() => clipboard = signerPublicKey"
                    v-if="hasGenerated"
                    class="wallet-link">
                    <v-icon>file_copy</v-icon>
                  </a>
                  <span v-if="hasGenerated && signerPublicKey === clipboard">Copied</span>
                  <v-btn @click="toggleNewPublicKey">{{ hasGenerated ? 'Remove' : 'Generate new' }}</v-btn>
                </v-layout>
              </td>
            </tr>
            <tr v-if="hasGenerated || selectedType === 'allow_trust'">
              <td><strong>New Signer seed</strong></td>
              <td>
                {{ hasGenerated ? signerSeed : null }}
                <v-text-field
                  v-if="!hasGenerated"
                  v-model="signerSeed"
                  :error-messages="signerSeedErrors"
                  required
                  single-line
                  @input="$v.signerSeed.$touch()"
                  @blur="$v.signerSeed.$touch()"
                />
                <a
                  v-clipboard:copy="signerSeed"
                  v-clipboard:success="() => clipboard = signerSeed"
                  v-if="hasGenerated"
                  class="wallet-link">
                  <v-icon>file_copy</v-icon>
                </a>
                <span v-if="hasGenerated && signerSeed === clipboard">Copied</span>
              </td>
            </tr>
            <tr>
              <td><strong>New Signer weight</strong></td>
              <td>
                <v-text-field
                  v-if="selectedType === 'other'"
                  v-model="weight"
                  :error-messages="weightErrors"
                  required
                  single-line
                  @input="$v.weight.$touch()"
                  @blur="$v.weight.$touch()"
                />
                <span v-else>1</span>
              </td>
            </tr>
            <tr/>
            <tr>
              <td><strong>Sign transaction with signer</strong></td>
              <td>
                <v-select
                  :items="signerItems"
                  v-model="selectedSigner"
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
          <v-checkbox
            v-model="confirmRisks"
            :error-messages="confirmRisksErrors"
            label="I confirm that I wrote down the seed of the new signer and will keep it in a safe place"
          />
        </v-card-text>
        <v-card-actions>
          <div v-if="errors.length > 0">
            <v-subheader v-for="error in errors" :key="error.error_code" class="error">{{ error.error_message }}</v-subheader>
          </div>
          <v-spacer/>
          <v-btn color="primary darken-1" flat="flat" @click.native="addSigner">Add</v-btn>
          <v-btn color="primary darken-1" flat="flat" @click.native="reset">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </form>
</template>

<script>
import { validationMixin } from 'vuelidate';
import StellarSdk from 'stellar-sdk';
import { required, integer, between, sameAs } from 'vuelidate/lib/validators';

import { secretSeed as validSecretSeed, publicKey as validPublicKey } from '@/util/validators';

import EditorWidget from '@/components/EditorWidget';

export default {
  name: 'AccountAddSignerForm',
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
  },
  validations () {
    const base = {
      name: { required },
      signerPublicKey: { required, validPublicKey },
      secret: { required, validSecretSeed },
    };
    let checkbox = {};
    if (this.hasGenerated) {
      checkbox = {
        confirmRisks: { required, confirmed: sameAs(() => true) }
      };
    }
    let signerSeed = {};
    if (this.selectedType === 'allow_trust') {
      signerSeed = {
        signerSeed: { required, validSecretSeed },
      };
    }
    let weight = {};
    if (this.selectedType === 'other') {
      weight = {
        weight: { required, integer, between: between(0, 255) },
      };
    }
    return {...base, ...checkbox, ...signerSeed, ...weight};
  },
  data () {
    return {
      name: '',
      description: '',
      selectedType: 'other',
      signerPublicKey: '',
      signerSeed: '',
      weight: '',

      secret: '',
      selectedSigner: this.data && this.data.signers ? this.data.signers[0].public_key : null,

      showDialog: true,

      addSignerPending: false,

      hasGenerated: false,

      confirmRisks: false,

      clipboard: null,

      typeItems: [
        {text: 'other', value: 'other'},
        {text: 'allow trust', value: 'allow_trust'},
      ]
    };
  },
  computed: {
    weightErrors () {
      const errors = [];
      if (!this.$v.weight.$dirty) return errors;
      !this.$v.weight.required && errors.push('Weight is required.');
      !this.$v.weight.integer && errors.push('Weight should be a number.');
      !this.$v.weight.between && errors.push('Weight should be a number between 0 and 255.');
      return errors;
    },

    confirmRisksErrors () {
      const errors = [];
      if (!this.$v.confirmRisks || !this.$v.confirmRisks.$dirty) return errors;
      !this.$v.confirmRisks.required && errors.push('Confirmation is required.');
      !this.$v.confirmRisks.confirmed && errors.push('Confirmation is required.');
      return errors;
    },

    nameErrors () {
      const errors = [];
      if (!this.$v.name.$dirty) return errors;
      !this.$v.name.required && errors.push('Name is required.');
      return errors;
    },

    signerPublicKeyErrors () {
      const errors = [];
      if (!this.$v.signerPublicKey.$dirty) return errors;
      !this.$v.signerPublicKey.required && errors.push('Public key is required.');
      !this.$v.signerPublicKey.validPublicKey && errors.push('Public key should be valid.');
      return errors;
    },

    signerSeedErrors () {
      const errors = [];
      if (!this.$v.signerSeed || !this.$v.signerSeed.$dirty) return errors;
      !this.$v.signerSeed.required && errors.push('Secret seed is required.');
      !this.$v.signerSeed.validSecretSeed && errors.push('Secret seed should be valid.');
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
      if (!val && this.addSignerPending) {
        this.addSignerPending = false;
        if (this.errors.length === 0) {
          this.reset();
        }
      }
    }
  },
  methods: {
    reset () {
      this.weight = '';
      this.name = '';
      this.description = '';
      this.selectedType = 'other';
      this.signerPublicKey = '';
      this.signerSeed = '';
      this.confirmRisks = false;

      this.hasGenerated = false;

      this.secret = '';
      this.showDialog = true;
      this.$v.$reset();
      this.$emit('reset');
    },

    addSigner () {
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }
      this.$emit('addSigner', {
        name: this.name,
        description: this.description,
        type: this.selectedType,
        weight: this.selectedType === 'allow_trust' ? 1 : this.weight,
        signerPublicKey: this.signerPublicKey,
        signerSecret: this.signerSeed,

        secret: this.secret,
        publicKey: this.selectedSigner,

        shouldCreateWallet: this.hasGenerated,
      });
      this.addSignerPending = true;
    },

    onCancel () {
      this.reset();
    },

    onSetClick () {
      if (this.signerItems.length === 0) {
        this.$root.$info('Error', 'No signer is available for changing signer weight.', { color: 'red' });
      } else {
        this.showDialog = true;
      }
    },

    toggleNewPublicKey () {
      if (this.hasGenerated) {
        this.hasGenerated = false;
        this.signerPublicKey = '';
        this.signerSeed = '';
        return;
      }
      this.hasGenerated = true;
      const keyPair = StellarSdk.Keypair.random();
      this.signerPublicKey = keyPair.publicKey();
      this.signerSeed = keyPair.secret();
    }
  }
};
</script>

<style lang="scss" scoped>
table {
  width: 100%;
  td {
    word-break: break-all;
  }
}
</style>
