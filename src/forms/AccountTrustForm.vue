<template>
  <form>
    <strong>Authorization flags:</strong> <a @click="onSetClick">Set</a>
    <br>
    Authorization required: {{ data.flags.auth_required ? 'YES' : 'NO' }}<br>
    Authorization revocable: {{ data.flags.auth_revocable ? 'YES' : 'NO' }}<br>
    Authorization immutable: {{ data.flags.auth_immutable ? 'YES' : 'NO' }}<br>

    <v-dialog v-model="showSetDialog" max-width="50%" @keydown.esc="showSetDialog = false">
      <v-toolbar color="primary" dark dense>
        <v-toolbar-title class="white--text">Edit authorization flags</v-toolbar-title>
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
              <td><strong>Current athorization flags</strong></td>
              <td>
                Authorization required: {{ data.flags.auth_required ? 'YES' : 'NO' }}<br>
                Authorization revocable: {{ data.flags.auth_revocable ? 'YES' : 'NO' }}<br>
                Authorization immutable: {{ data.flags.auth_immutable ? 'YES' : 'NO' }}<br>
              </td>
            </tr>
            <tr style="vertical-align:top">
              <td><strong>New authorization</strong></td>
              <td>
                <v-radio-group v-model="authRequired" label="Authorization required" >
                  <v-radio :value="true" label="YES"/>
                  <v-radio :value="false" label="NO" />
                </v-radio-group>

                <v-radio-group :disabled="authRequired === false" v-model="authRevocable" label="Authorization revocable">
                  <v-radio :value="true" label="YES" />
                  <v-radio :value="false" label="NO" />
                </v-radio-group>

                <v-radio-group v-model="authImmutable" label="Authorization immutable">
                  <v-radio :value="true" label="YES" />
                  <v-radio :value="false" label="NO" />
                </v-radio-group>
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

import { secretSeed as validSecretSeed } from '@/util/validators';

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
      secret: { required, validSecretSeed },
    };

    return base;
  },
  data () {
    return {
      authRequired: this.data.flags.auth_required,
      authRevocable: this.data.flags.auth_revocable,
      authImmutable: this.data.flags.auth_immutable,

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
      return acc.signers.filter(signer => signer.weight >= this.data.thresholds.med_threshold).map(signer => ({
        text: `${signer.public_key.slice(0, 16)}... weight ${signer.weight}`,
        value: signer.public_key,
      }));
    },
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
      this.authRequired = this.data.flags.auth_required;
      this.authRevocable = this.data.flags.auth_revocable;
      this.authImmutable = this.data.flags.auth_immutable;

      this.secret = '';
      this.showSetDialog = false;
      this.$v.$reset();
    },

    setStellarData () {
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }

      this.$emit('setStellarData', {
        authRequired: this.authRequired,
        authRevocable: this.authRevocable,
        authImmutable: this.authImmutable,

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
        this.$root.$info('Error', 'No signer is available for changing authorization flags.', { color: 'red' });
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
