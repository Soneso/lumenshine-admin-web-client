<template>
  <form>
    <v-dialog v-model="showDialog" max-width="50%" @keydown.esc="showDialog = false">
      <v-toolbar color="primary" dark dense>
        <v-toolbar-title class="white--text">{{ type === 'add' ? 'Add trustline' : 'Remove trusline' }}</v-toolbar-title>
      </v-toolbar>
      <v-card tile>
        <v-card-text>
          <v-progress-linear v-if="loading" :indeterminate="true"/>
          <table>
            <tr>
              <td><strong>Issuer account</strong></td>
              <td>x</td>
            </tr>
            <tr>
              <td><strong>Issuer public key</strong></td>
              <td>x</td>
            </tr>
            <tr>
              <td><strong>Asset code</strong></td>
              <td>x</td>
            </tr>
            <tr/>
            <tr>
              <td><strong>Account public key</strong></td>
              <td>{{ data.public_key }}</td>
            </tr>
            <tr>
              <td><strong>Account thresholds</strong></td>
              <td>low threshold: {{ data.thresholds.low_threshold }}, medium threshold: {{ data.thresholds.med_threshold }}, high threshold: {{ data.thresholds.high_threshold }}</td>
            </tr>
            <tr>
              <td><strong>Requesting account public key</strong></td>
              <td>{{ requester.public_key }}</td>
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
        </v-card-text>
        <v-card-actions>
          <div v-if="errors.length > 0">
            <v-subheader v-for="error in errors" :key="error.error_code" class="error">{{ error.error_message }}</v-subheader>
          </div>
          <v-spacer/>
          <v-btn v-if="type === 'add'" color="primary darken-1" flat="flat" @click.native="addTrustline">Submit</v-btn>
          <v-btn v-else color="red darken-1" flat="flat" @click.native="removeTrustline">Remove</v-btn>
          <v-btn color="primary darken-1" flat="flat" @click.native="reset">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </form>
</template>

<script>
import { validationMixin } from 'vuelidate';
import { required } from 'vuelidate/lib/validators';

import { secretSeed as validSecretSeed } from '@/util/validators';

import EditorWidget from '@/components/EditorWidget';

export default {
  name: 'AccountSignerChangeWeightForm',
  components: { EditorWidget },
  mixins: [validationMixin],
  props: {
    data: {
      type: Object,
      default: () => ({})
    },
    requester: {
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
    type: {
      type: String,
      required: true,
    }
  },
  validations () {
    const base = {
      reason: { required },
      secret: { required, validSecretSeed },
    };
    return base;
  },
  data () {
    return {
      reason: '',

      secret: '',
      selectedSigner: this.data && this.data.signers ? this.data.signers[0].public_key : null,

      showDialog: true,

      changePending: false,
    };
  },
  computed: {
    reasonErrors () {
      const errors = [];
      if (!this.$v.reason.$dirty) return errors;
      !this.$v.reason.required && errors.push('Reason is required.');
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
      return acc.signers.filter(signer => signer.weight >= this.data.thresholds.low_threshold).map(signer => ({
        text: `${signer.public_key.slice(0, 16)}... weight ${signer.weight}`,
        value: signer.public_key,
      }));
    },
  },
  watch: {
    loading (val) {
      if (!val && this.updatePending) {
        this.updatePending = false;
        if (this.errors.length === 0) {
          this.reset();
        }
      }
    }
  },
  methods: {
    reset () {
      this.reason = '';
      this.secret = '';
      this.showDialog = true;
      this.$v.$reset();
      this.$emit('reset');
    },

    addTrustline () {
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }
      this.$emit('addTrustline', {
        type: this.type,
        reason: this.reason,
        trustlinePublicKey: this.requester.public_key,
        secret: this.secret,
        publicKey: this.selectedSigner,
      });

      this.updatePending = true;
    },

    removeTrustline () {
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }
      this.$emit('removeTrustline', {
        type: this.type,
        reason: this.reason,
        trustlinePublicKey: this.requester.public_key,
        secret: this.secret,
        publicKey: this.selectedSigner,
      });

      this.updatePending = true;
    },

    onCancel () {
      this.reset();
    },

    onSetClick () {
      if (this.signerItems.length === 0) {
        this.$root.$info('Error', 'No signer is available for this operation.', { color: 'red' });
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
