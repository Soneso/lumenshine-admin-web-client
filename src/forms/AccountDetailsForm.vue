<template>
  <form>
    <editor-widget :has-error="$v.name.$invalid" @cancel="onCancel" @submit="setName">
      <template slot="header">
        <strong>Name:</strong>
      </template>
      {{ name }}
      <template slot="editor">
        <v-text-field
          v-model="name"
          :error-messages="nameErrors"
          label="Name"
          required
          single-line
          @input="$v.name.$touch()"
          @blur="$v.name.$touch()"
        />
      </template>
    </editor-widget>

    <editor-widget :has-error="$v.description.$invalid" @cancel="onCancel" @submit="setDescription">
      <template slot="header">
        <strong>Description:</strong>
      </template>
      {{ description }}
      <template slot="editor">
        <v-text-field
          v-model="description"
          :error-messages="descriptionErrors"
          label="Description"
          required
          single-line
          @input="$v.description.$touch()"
          @blur="$v.description.$touch()"
        />
      </template>
    </editor-widget>

    <div><strong>Type:</strong> {{ data.type }}</div><br>

    <div><strong>Public key:</strong> {{ data.public_key }}</div><br>

    <div>
      <strong>Balances:</strong>
      <table v-if="formattedBalances">
        <tr v-for="balance in formattedBalances" :key="balance"><td>{{ balance }}</td></tr>
      </table>
      <span v-else>Account not funded</span>
    </div>

  </form>
</template>

<script>
import { validationMixin } from 'vuelidate';
import { required, maxLength } from 'vuelidate/lib/validators';

import EditorWidget from '@/components/EditorWidget';

export default {
  name: 'AccountDetailsForm',
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
      name: { required, maxLength: maxLength(256) },
      description: { required },
    };

    return base;
  },

  data () {
    return {
      name: this.data.name || '',
      description: this.data.description || '',
    };
  },
  computed: {
    nameErrors () {
      const errors = [];
      if (!this.$v.name.$dirty) return errors;
      !this.$v.name.required && errors.push('Name is required.');
      !this.$v.name.maxLength && errors.push('Max length for name is 256 characters.');
      return errors;
    },
    descriptionErrors () {
      const errors = [];
      if (!this.$v.description.$dirty) return errors;
      !this.$v.description.required && errors.push('Description is required.');
      return errors;
    },
    formattedBalances () {
      if (!this.data.balances) return null;
      const xlmBalance = `${this.data.balances.find(b => b.asset_type === 'native').balance} XLM`;

      const otherBalances = this.data.balances.filter(b => b.asset_type !== 'native');
      otherBalances.map(bal => `${bal.balance} ${bal.asset_code}`);
      return [xlmBalance, ...otherBalances.map(bal => `${bal.balance} ${bal.asset_code}`)];
    },
  },
  methods: {
    setName () {
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }
      this.$emit('setName', { name: this.name, publicKey: this.data.public_key });
    },
    setDescription () {
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }
      this.$emit('setDescription', { description: this.description, publicKey: this.data.public_key });
    },
    onCancel () {
      this.name = this.data.name || '';
      this.description = this.data.description || '';
      this.$v.$reset();
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
