<template>
  <form>
    <editor-widget :has-error="errors.length > 0" @cancel="onCancel" @submit="setStellarData">
      <template slot="header">
        <strong>Authorization flags:</strong>
      </template>
      Authorization required: {{ authRequired ? 'YES' : 'NO' }}<br>
      Authorization revocable: {{ authRevocable ? 'YES' : 'NO' }}<br>
      Authorization immutable: {{ authImmutable ? 'YES' : 'NO' }}<br>
      <template slot="editor">
        <v-checkbox
          v-model="authRequired"
          label="Authorization required"
        />

        <v-checkbox
          v-model="authRevocable"
          :disabled="authRequired === false"
          label="Authorization revocable"
        />

        <v-checkbox
          v-model="authImmutable"
          label="Authorization immutable"
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

import { secretSeed as validSecretSeed } from '@/util/validators';

import EditorWidget from '@/components/EditorWidget';

export default {
  name: 'AccountTrustForm',
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
      required: true
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
      secret: '',

      authRequired: this.data.flags.auth_required,
      authRevocable: this.data.flags.auth_revocable,
      authImmutable: this.data.flags.auth_immutable,
    };
  },
  computed: {
    secretErrors () {
      console.log('secret', this.secret);
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
        authRequired: this.authRequired,
        authRevocable: this.authRevocable,
        authImmutable: this.authImmutable,

        secret: this.secret,
        publicKey: this.data.public_key
      });
      this.secret = '';
    },
    onCancel () {
      this.uthRequired = this.data.flags.auth_required;
      this.uthRevocable = this.data.flags.auth_revocable;
      this.uthImmutable = this.data.flags.auth_immutable;
      this.$v.$reset();
    },
  }
};
</script>

<style lang="scss" scoped>
</style>
