<template>
  <form>
    <editor-widget :has-error="$v.homeDomain.$invalid" @cancel="onCancel" @submit="setStellarData">
      <template slot="header">
        <strong>Home domain</strong>
      </template>
      <span :class="{'warning-text': !homeDomain}">{{ homeDomain || '(not set)' }}</span>
      <template slot="editor">
        <v-text-field
          v-model="homeDomain"
          :error-messages="homeDomainErrors"
          label="Home Domain"
          required
          single-line
          @input="$v.homeDomain.$touch()"
          @blur="$v.homeDomain.$touch()"
        />
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
  },

  validations () {
    const base = {
      homeDomain: { validDomain },
      secret: { required, validSecretSeed },
    };

    return base;
  },

  data () {
    return {
      homeDomain: this.data.home_domain || '',
      secret: '',
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
        secret: this.secret,
        publicKey: this.data.public_key
      });
      this.secret = '';
    },
    onCancel () {
      this.homeDomain = this.data.home_domain || '';
      this.$v.$reset();
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
