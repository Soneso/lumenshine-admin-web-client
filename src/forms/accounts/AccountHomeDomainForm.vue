<template>
  <form>
    <strong>Home domain</strong> <a @click="onSetClick">Set</a>
    <br>
    <span :class="{'warning-text': !data.home_domain}">{{ data.home_domain || '(not set)' }}</span>

    <v-dialog v-model="showSetDialog" max-width="50%" @keydown.esc="showSetDialog = false">
      <v-toolbar color="primary" dark dense>
        <v-toolbar-title class="white--text">Set Home Domain</v-toolbar-title>
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
              <td><strong>Current home domain</strong></td>
              <td>{{ data.home_domain || 'not set' }}</td>
            </tr>
            <tr>
              <td><strong>New home domain</strong></td>
              <td>
                <v-text-field
                  v-model="homeDomain"
                  :error-messages="homeDomainErrors"
                  required
                  single-line
                  @input="$v.homeDomain.$touch()"
                  @blur="$v.homeDomain.$touch()"
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
import { required } from 'vuelidate/lib/validators';

import { secretSeed as validSecretSeed, domain as validDomain } from '@/util/validators';

import EditorWidget from '@/components/EditorWidget';

export default {
  name: 'AccountHomeDomainForm',
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
      homeDomain: { validDomain, hasNewValue: val => val !== this.data.home_domain },
      secret: { required, validSecretSeed },
    };

    return base;
  },
  data () {
    return {
      homeDomain: this.data.home_domain || '',
      secret: '',
      signer: this.data && this.data.signers ? this.data.signers[0].public_key : null,

      showSetDialog: false,

      changePending: false,
    };
  },
  computed: {
    homeDomainErrors () {
      const errors = [];
      if (!this.$v.homeDomain.$dirty) return errors;
      !this.$v.homeDomain.validDomain && errors.push('Home domain should be a valid domain name.');
      !this.$v.homeDomain.hasNewValue && errors.push('Nothing changed.');
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
    data (val) {
      this.homeDomain = this.data.home_domain || '';
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
      this.homeDomain = this.data.home_domain || '';
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
      this.$emit('setStellarData', {
        homeDomain: this.homeDomain,
        secret: this.secret,
        publicKey: this.signer,
      });
      this.changePending = true;
    },

    onCancel () {
      this.reset();
    },

    onSetClick () {
      if (this.signerItems.length === 0) {
        this.$root.$info('Error', 'No signer is available for changing the home domain.', { color: 'red' });
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
