<template>
  <v-flex xs12 sm7>
    <form>
      <v-layout row justify-space-between>
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
        <div>
          <strong>Type:</strong>
          {{ data.type }}
        </div>
      </v-layout>

      <div>
        <strong>Public key:</strong> {{ data.public_key }}
        <a
          v-clipboard:copy="data.public_key"
          v-clipboard:success="() => onCopy(data.public_key)"
          class="wallet-link">
          <v-icon>file_copy</v-icon>
        </a>
        <span v-if="data.public_key === copiedAccount">Copied</span>
      </div>
      <br>

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

      <div>
        <strong>Balances:</strong>
        <table v-if="formattedBalances">
          <tr v-for="balance in formattedBalances" :key="balance.text">
            <td>{{ balance.text }} &nbsp;&nbsp;&nbsp;&nbsp;<a href="#" @click.prevent="selectedBalance = balance">Send</a></td>
          </tr>
        </table>
        <span v-else>Account not funded</span>
        <account-send-payment-form v-if="selectedBalance" :data="data" :balance="selectedBalance" @sendPayment="params => $emit('sendPayment', params)"/>
      </div>

    </form>
  </v-flex>
</template>

<script>
import { validationMixin } from 'vuelidate';
import { required, maxLength } from 'vuelidate/lib/validators';

import EditorWidget from '@/components/EditorWidget';
import AccountSendPaymentForm from '@/forms/AccountSendPaymentForm';

export default {
  name: 'AccountDetailsForm',
  components: { EditorWidget, AccountSendPaymentForm },
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

      copiedAccount: null,
      selectedBalance: null,
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

      const xlmBalance = this.data.balances.find(b => b.asset_type === 'native');
      xlmBalance.text = `${xlmBalance.balance} XLM`;

      const otherBalances = this.data.balances.filter(b => b.asset_type !== 'native');
      otherBalances.forEach(bal => {
        bal.text = `${bal.balance} ${bal.asset_code}`;
      });
      return [xlmBalance, ...otherBalances];
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
    },

    onCopy (account) {
      this.copiedAccount = account;
    },
  }
};
</script>

<style lang="scss" scoped>
</style>
