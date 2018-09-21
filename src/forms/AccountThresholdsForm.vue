<template>
  <form>
    <strong>Thresholds:</strong> <a href="#" @click.prevent="onEditClick">Edit</a>
    <br>
    low threshold: {{ thresholdLow }}<br>
    medium threshold: {{ thresholdMed }}<br>
    high threshold: {{ thresholdHigh }}<br>

    <v-dialog v-model="showSetDialog" max-width="50%" @keydown.esc="showSetDialog = false">
      <v-toolbar color="primary" dark dense>
        <v-toolbar-title class="white--text">Edit thresholds</v-toolbar-title>
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
            <tr style="vertical-align:top">
              <td><strong>New thresholds</strong></td>
              <td>
                <v-text-field
                  v-model="thresholdLow"
                  :error-messages="thresholdLowErrors"
                  label="Threshold low"
                  required
                  @input="$v.thresholdLow.$touch()"
                  @blur="$v.thresholdLow.$touch()"
                />
                <v-text-field
                  v-model="thresholdMed"
                  :error-messages="thresholdMedErrors"
                  label="Threshold med"
                  required
                  @input="$v.thresholdMed.$touch()"
                  @blur="$v.thresholdMed.$touch()"
                />
                <v-text-field
                  v-model="thresholdHigh"
                  :error-messages="thresholdHighErrors"
                  label="Threshold high"
                  required
                  @input="$v.thresholdHigh.$touch()"
                  @blur="$v.thresholdHigh.$touch()"
                />
              </td>
            </tr>
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
          <v-checkbox
            v-model="confirmRisks"
            :error-messages="confirmRisksErrors"
            label="I confirm that I understand the meaning of the thresholds and the risks of changing them"
          />
        </v-card-text>
        <v-card-actions>
          <div v-if="errors.length > 0">
            <v-subheader v-for="error in errors" :key="error.error_code" class="error">{{ error.error_message }}</v-subheader>
          </div>
          <v-spacer/>
          <v-btn color="primary darken-1" flat="flat" @click.native="setStellarData">Submit</v-btn>
          <v-btn color="primary darken-1" flat="flat" @click.native="reset">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </form>
</template>

<script>
import { validationMixin } from 'vuelidate';
import { required, between, integer, sameAs } from 'vuelidate/lib/validators';

import { secretSeed as validSecretSeed } from '@/util/validators';

import EditorWidget from '@/components/EditorWidget';

export default {
  name: 'AccountThresholdsForm',
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
    }
  },
  validations () {
    const base = {
      secret: { required, validSecretSeed },

      thresholdLow: { required, integer, between: between(0, 255) },
      thresholdMed: { required, integer, between: between(0, 255) },
      thresholdHigh: { required, integer, between: between(0, 255) },

      confirmRisks: { required, confirmed: sameAs(() => true) }
    };

    return base;
  },
  data () {
    return {
      thresholdLow: this.data.thresholds.low_threshold,
      thresholdMed: this.data.thresholds.med_threshold,
      thresholdHigh: this.data.thresholds.high_threshold,

      confirmRisks: false,

      secret: '',
      signer: this.data && this.data.signers ? this.data.signers[0].public_key : null,

      showSetDialog: false,
      changePending: false,
    };
  },
  computed: {
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
      return acc.signers.filter(signer => signer.weight >= this.data.thresholds.high_threshold).map(signer => ({
        text: `${signer.public_key.slice(0, 16)}... weight ${signer.weight}`,
        value: signer.public_key,
      }));
    },

    thresholdLowErrors () {
      const errors = [];
      if (!this.$v.thresholdLow.$dirty) return errors;
      !this.$v.thresholdLow.required && errors.push('Low threshold is required.');
      !this.$v.thresholdLow.integer && errors.push('Low threshold should be a number.');
      !this.$v.thresholdLow.between && errors.push('Low threshold should be a number between 0 and 255.');
      return errors;
    },

    thresholdMedErrors () {
      const errors = [];
      if (!this.$v.thresholdMed.$dirty) return errors;
      !this.$v.thresholdMed.required && errors.push('Med threshold is required.');
      !this.$v.thresholdMed.integer && errors.push('Med threshold should be a number.');
      !this.$v.thresholdMed.between && errors.push('Med threshold should be a number between 0 and 255.');
      return errors;
    },

    thresholdHighErrors () {
      const errors = [];
      if (!this.$v.thresholdHigh.$dirty) return errors;
      !this.$v.thresholdHigh.required && errors.push('High threshold is required.');
      !this.$v.thresholdHigh.integer && errors.push('High threshold should be a number.');
      !this.$v.thresholdHigh.between && errors.push('High threshold should be a number between 0 and 255.');
      return errors;
    },

    confirmRisksErrors () {
      const errors = [];
      if (!this.$v.confirmRisks.$dirty) return errors;
      !this.$v.confirmRisks.required && errors.push('Confirmation is required.');
      !this.$v.confirmRisks.confirmed && errors.push('Confirmation is required.');
      return errors;
    }

  },
  watch: {
    data (val) {
      this.authRequired = this.data.flags.auth_required;
      this.authRevocable = this.data.flags.auth_revocable;
      this.authImmutable = this.data.flags.auth_immutable;
    },

    loading (val) {
      if (!val && this.changePending) {
        this.changePending = false;
        if (this.errors.length === 0) {
          this.reset();
        }
      }
    }
  },
  methods: {
    reset () {
      this.thresholdLow = this.data.thresholds.low_threshold;
      this.thresholdMed = this.data.thresholds.med_threshold;
      this.thresholdHigh = this.data.thresholds.high_threshold;

      this.secret = '';
      this.showSetDialog = false;
      this.$v.$reset();
      this.$emit('reset');
    },

    setStellarData () {
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }

      this.changePending = true;
      this.$emit('setStellarData', {
        thresholdLow: this.thresholdLow,
        thresholdMed: this.thresholdMed,
        thresholdHigh: this.thresholdHigh,

        secret: this.secret,
        publicKey: this.signer,
      });
    },

    onCancel () {
      this.reset();
    },

    onEditClick () {
      if (this.signerItems.length === 0) {
        this.$root.$info('Error', 'No signer is available for changing thresholds.', { color: 'red' });
      } else {
        this.showSetDialog = true;
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
