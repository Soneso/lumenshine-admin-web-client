<template>
  <form>
    <editor-widget :has-error="$v.$invalid" @cancel="onCancel" @submit="setStellarData">
      <template slot="header">
        <strong>Thresholds:</strong>
      </template>
      low threshold: {{ thresholdLow }}<br>
      medium threshold: {{ thresholdMed }}<br>
      high threshold: {{ thresholdHigh }}<br>
      <template slot="editor">
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
        <v-text-field
          v-model="secret"
          :error-messages="secretErrors"
          label="Account secret"
          required
          @input="$v.secret.$touch()"
          @blur="$v.secret.$touch()"
        />
      </template>
    </editor-widget>
  </form>
</template>

<script>
import { validationMixin } from 'vuelidate';
import { required, integer, between } from 'vuelidate/lib/validators';

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
  },

  validations () {
    const base = {
      secret: { required, validSecretSeed },

      thresholdLow: { required, integer, between: between(0, 255) },
      thresholdMed: { required, integer, between: between(0, 255) },
      thresholdHigh: { required, integer, between: between(0, 255) },
    };

    return base;
  },

  data () {
    return {
      secret: '',

      thresholdLow: this.data.thresholds.low_threshold,
      thresholdMed: this.data.thresholds.med_threshold,
      thresholdHigh: this.data.thresholds.high_threshold,
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
        thresholdLow: this.thresholdLow,
        thresholdMed: this.thresholdMed,
        thresholdHigh: this.thresholdHigh,

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
