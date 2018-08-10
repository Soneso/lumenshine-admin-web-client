<template>
  <form>
    <v-text-field
      v-model="homeDomain"
      :error-messages="homeDomainErrors"
      label="Home Domain"
      required
      @input="$v.homeDomain.$touch()"
      @blur="$v.homeDomain.$touch()"
    />

    <v-checkbox
      v-model="authRequired"
      label="Authorization required"
    />

    <v-checkbox
      v-model="authRevocable"
      :disabled="authRequired === false"
      label="Authorization revocable"
    />

    <v-text-field
      v-model="masterKeyWeight"
      :error-messages="masterKeyWeightErrors"
      label="Master key weight"
      required
      @input="$v.masterKeyWeight.$touch()"
      @blur="$v.masterKeyWeight.$touch()"
    />

    <v-container grid-list-md>
      <v-layout wrap>
        <v-flex xs12 sm6 md4>
          <v-text-field
            v-model="thresholdLow"
            :error-messages="thresholdLowErrors"
            label="Threshold low"
            required
            @input="$v.thresholdLow.$touch()"
            @blur="$v.thresholdLow.$touch()"
          />
        </v-flex>
        <v-flex xs12 sm6 md4>
          <v-text-field
            v-model="thresholdMed"
            :error-messages="thresholdMedErrors"
            label="Threshold med"
            required
            @input="$v.thresholdMed.$touch()"
            @blur="$v.thresholdMed.$touch()"
          />
        </v-flex>
        <v-flex xs12 sm6 md4>
          <v-text-field
            v-model="thresholdHigh"
            :error-messages="thresholdHighErrors"
            label="Threshold high"
            required
            @input="$v.thresholdHigh.$touch()"
            @blur="$v.thresholdHigh.$touch()"
          />
        </v-flex>
      </v-layout>
    </v-container>

    <v-text-field
      v-model="secret"
      :error-messages="secretErrors"
      label="Account secret"
      required
      @input="$v.secret.$touch()"
      @blur="$v.secret.$touch()"
    />

    <v-btn @click="setStellarData">Save</v-btn>
  </form>
</template>

<script>
import { validationMixin } from 'vuelidate';
import { required, integer, between } from 'vuelidate/lib/validators';

import { secretSeed as validSecretSeed, domain as validDomain } from '@/util/validators';

import EditorWidget from '@/components/EditorWidget';

export default {
  name: 'AccountStellarForm',
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
  },

  validations () {
    const base = {
      homeDomain: { validDomain },
      secret: { required, validSecretSeed },

      thresholdLow: { required, integer, between: between(0, 255) },
      thresholdMed: { required, integer, between: between(0, 255) },
      thresholdHigh: { required, integer, between: between(0, 255) },

      masterKeyWeight: { required, integer, between: between(0, 255) },
    };

    return base;
  },

  data () {
    const masterKey = this.data.signers.find(signer => signer.public_key === this.data.id);
    return {
      homeDomain: this.data.home_domain || '',
      secret: '',

      authRequired: this.data.flags.auth_required,
      authRevocable: this.data.flags.auth_revocable,

      thresholdLow: this.data.thresholds.low_threshold,
      thresholdMed: this.data.thresholds.med_threshold,
      thresholdHigh: this.data.thresholds.high_threshold,

      masterKeyWeight: masterKey ? masterKey.weight : 0,
    };
  },
  computed: {
    homeDomainErrors () {
      const errors = [];
      if (!this.$v.homeDomain.$dirty) return errors;
      !this.$v.homeDomain.validDomain && errors.push('Home domain should be a valid domain name.');
      return errors;
    },
    secretErrors () {
      const errors = [];
      if (!this.$v.secret.$dirty) return errors;
      !this.$v.secret.required && errors.push('Secret is required.');
      !this.$v.secret.validSecretSeed && errors.push('Secret seed should be valid.');
      return errors;
    },
    masterKeyWeightErrors () {
      const errors = [];
      if (!this.$v.masterKeyWeight.$dirty) return errors;
      !this.$v.masterKeyWeight.required && errors.push('Master key weight is required.');
      !this.$v.masterKeyWeight.integer && errors.push('Master key weight should be a number.');
      !this.$v.masterKeyWeight.between && errors.push('Master key weight should be a number between 0 and 255.');
      return errors;
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
  },
  watch: {
    authRequired (val) {
      if (!val) {
        this.authRevocable = false;
      }
    }
  },
  methods: {
    setStellarData () {
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }
      this.$emit('setStellarData', {
        homeDomain: this.homeDomain,

        authRequired: this.authRequired,
        authRevocable: this.authRevocable,

        thresholdLow: this.thresholdLow,
        thresholdMed: this.thresholdMed,
        thresholdHigh: this.thresholdHigh,

        masterKeyWeight: this.masterKeyWeight,
        secret: this.secret,
        publicKey: this.data.public_key
      });
      this.secret = '';
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
