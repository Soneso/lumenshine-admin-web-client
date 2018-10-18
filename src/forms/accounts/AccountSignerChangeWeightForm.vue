<template>
  <form>
    <v-dialog v-model="showDialog" max-width="50%" @keydown.esc="showDialog = false">
      <v-toolbar color="primary" dark dense>
        <v-toolbar-title class="white--text">Change signer weight</v-toolbar-title>
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
            <tr v-if="signer.name">
              <td><strong>Signer name</strong></td>
              <td>{{ signer.name }}</td>
            </tr>
            <tr>
              <td><strong>Signer public key</strong></td>
              <td>{{ signer.public_key }}</td>
            </tr>
            <tr>
              <td><strong>Signer current weight</strong></td>
              <td>{{ signer.weight }}</td>
            </tr>
            <tr/>
            <tr>
              <td><strong>Change weight to</strong></td>
              <td>
                <v-text-field
                  v-model="weight"
                  :error-messages="weightErrors"
                  required
                  single-line
                  @input="$v.weight.$touch()"
                  @blur="$v.weight.$touch()"
                />
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
        </v-card-text>
        <v-card-actions>
          <div v-if="errors.length > 0">
            <v-subheader v-for="error in errors" :key="error.error_code" class="error">{{ error.error_message }}</v-subheader>
          </div>
          <v-spacer/>
          <v-btn color="primary darken-1" flat="flat" @click.native="updateSigner">Submit</v-btn>
          <v-btn color="primary darken-1" flat="flat" @click.native="reset">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </form>
</template>

<script>
import { validationMixin } from 'vuelidate';
import { required, integer, between } from 'vuelidate/lib/validators';

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
    signer: {
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
      weight: { required, integer, between: between(0, 255) },
      secret: { required, validSecretSeed },
    };
    return base;
  },
  data () {
    return {
      weight: this.signer.weight,

      secret: '',
      selectedSigner: this.data && this.data.signers ? this.data.signers[0].public_key : null,

      showDialog: true,

      changePending: false,
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
      if (!val && this.updateSignerPending) {
        this.updateSignerPending = false;
        if (this.errors.length === 0) {
          this.reset();
        }
      }
    }
  },
  methods: {
    reset () {
      this.weight = this.signer.weight;
      this.secret = '';
      this.showDialog = true;
      this.$v.$reset();
      this.$emit('reset');
    },

    updateSigner () {
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }
      this.$emit('updateSigner', {
        weight: this.weight,
        signerPublicKey: this.signer.public_key,
        secret: this.secret,
        publicKey: this.selectedSigner,
      });
      this.updateSignerPending = true;
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
    }
  }
};
</script>

<style lang="scss" scoped>
table {
  width: 100%;
}
</style>
