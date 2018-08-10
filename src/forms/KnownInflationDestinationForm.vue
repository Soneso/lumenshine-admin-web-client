<template>
  <form>
    <v-text-field
      v-model="name"
      :disabled="readonly"
      :error-messages="nameErrors"
      label="Name"
      required
      @input="$v.name.$touch()"
      @blur="$v.name.$touch()"
    />
    <v-text-field
      v-model="issuerPublicKey"
      :disabled="readonly"
      :error-messages="issuerPublicKeyErrors"
      label="Issuer Public Key"
      required
      @input="$v.issuerPublicKey.$touch()"
      @blur="$v.issuerPublicKey.$touch()"
    />

    <v-text-field
      v-model="shortDescription"
      :disabled="readonly"
      :error-messages="shortDescriptionErrors"
      label="Short Description"
      required
      @input="$v.shortDescription.$touch()"
      @blur="$v.shortDescription.$touch()"
    />

    <v-text-field
      v-model="longDescription"
      :disabled="readonly"
      :error-messages="longDescriptionErrors"
      label="Long Description"
      required
      @input="$v.longDescription.$touch()"
      @blur="$v.longDescription.$touch()"
    />

    <!-- <v-text-field
      v-model="orderIndex"
      :disabled="readonly"
      :error-messages="orderIndexErrors"
      label="Order Index"
      required
      @input="$v.orderIndex.$touch()"
      @blur="$v.orderIndex.$touch()"
    /> -->

    <v-btn v-if="!readonly" @click="submitForm">submit</v-btn>
    <v-btn @click="onCancelClick">Cancel</v-btn>
  </form>
</template>

<script>
import { validationMixin } from 'vuelidate';
import { required, minLength, maxLength, alphaNum } from 'vuelidate/lib/validators';

export default {
  name: 'KnownInflationDestinationForm',
  mixins: [validationMixin],
  props: {
    data: {
      type: Object,
      default: () => ({})
    },
    readonly: {
      type: Boolean,
      default: false,
    }
  },

  validations () {
    return {
      name: { required },
      issuerPublicKey: { required, alphaNum, minLength: minLength(56), maxLength: maxLength(56) },
      shortDescription: { required },
      longDescription: { required },
    };
  },

  data () {
    return {
      name: this.data.name || '',
      issuerPublicKey: this.data.issuerPublicKey || '',
      shortDescription: this.data.shortDescription || '',
      longDescription: this.data.longDescription || '',
    };
  },
  computed: {
    nameErrors () {
      const errors = [];
      if (!this.$v.name.$dirty) return errors;
      !this.$v.name.required && errors.push('Name  is required.');
      return errors;
    },
    issuerPublicKeyErrors () {
      const errors = [];
      if (!this.$v.issuerPublicKey.$dirty) return errors;
      !this.$v.issuerPublicKey.required && errors.push('Issuer Public Key is required.');
      !this.$v.issuerPublicKey.alphaNum && errors.push('Issuer Public Key must be alphanumeric.');
      !this.$v.issuerPublicKey.minLength && errors.push('Issuer Public Key must have length 56.');
      !this.$v.issuerPublicKey.maxLength && errors.push('Issuer Public Key must have length 56.');
      return errors;
    },
    shortDescriptionErrors () {
      const errors = [];
      if (!this.$v.shortDescription.$dirty) return errors;
      !this.$v.shortDescription.required && errors.push('Short Description is required.');
      return errors;
    },
    longDescriptionErrors () {
      const errors = [];
      if (!this.$v.longDescription.$dirty) return errors;
      !this.$v.longDescription.required && errors.push('Long Description is required.');
      return errors;
    },
  },
  methods: {
    async submitForm () {
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }

      this.$emit('submit', {
        name: this.name,
        issuer_public_key: this.issuerPublicKey,
        short_description: this.shortDescription,
        long_description: this.longDescription,
      });
    },
    onCancelClick () {
      this.$emit('cancel');
    },
  }
};
</script>

<style lang="scss" scoped>
</style>
