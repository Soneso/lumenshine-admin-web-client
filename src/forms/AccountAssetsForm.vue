<template>
  <form>
    <editor-widget v-if="data.type === 'issuing'" :has-error="$v.newAssetCode.$invalid" button-text="Add" @cancel="onCancel" @submit="onSubmit">
      <template slot="header">
        <strong>Asset codes:</strong>
      </template>
      <table>
        <tr v-for="asset_code in data.asset_codes" :key="asset_code">
          <td>{{ asset_code }}</td>
          <td>
            <a href="#" @click.prevent="selectedAsset = asset_code">Send</a>
            <a href="#" class="warning-text" @click="onDelete(asset_code, data.public_key)">Remove</a>
          </td>
        </tr>
      </table>
      <template slot="editor">
        <v-text-field
          v-model="newAssetCode"
          :error-messages="newAssetCodeErrors"
          label="New asset code"
          required
          single-line
          @input="$v.newAssetCode.$touch()"
          @blur="$v.newAssetCode.$touch()"
        />
        <table>
          <tr v-for="asset_code in data.asset_codes" :key="asset_code">
            <td>{{ asset_code }}</td>
            <td>
              <a href="#" @click.prevent="selectedAsset = asset_code">Send</a>
              <a href="#" class="warning-text" @click.prevent="onDelete(asset_code, data.public_key)">Remove</a>
            </td>
          </tr>
        </table>
      </template>
    </editor-widget>
    <account-send-payment-form
      v-if="selectedAsset"
      :loading="loading"
      :data="data"
      :asset-code="selectedAsset"
      @sendPayment="params => $emit('sendPayment', params)"
      @reset="selectedAsset = null"
    />
  </form>
</template>

<script>
import { validationMixin } from 'vuelidate';
import { required } from 'vuelidate/lib/validators';

import { assetCode as validAssetCode } from '@/util/validators';

import EditorWidget from '@/components/EditorWidget';
import AccountSendPaymentForm from '@/forms/AccountSendPaymentForm';

export default {
  name: 'AccountAssetsForm',
  components: { EditorWidget, AccountSendPaymentForm },
  mixins: [validationMixin],
  props: {
    data: {
      type: Object,
      default: () => ({})
    },
    loading: {
      type: Boolean,
      required: true,
    },
    errors: {
      type: Array,
      default: () => []
    },
  },

  validations () {
    return {
      newAssetCode: { required, validAssetCode },
    };
  },

  data () {
    return {
      newAssetCode: '',
      selectedAsset: null,
    };
  },

  computed: {
    newAssetCodeErrors () {
      const errors = [];
      if (!this.$v.newAssetCode.$dirty) return errors;
      !this.$v.newAssetCode.required && errors.push('New asset code is required.');
      !this.$v.newAssetCode.validAssetCode && errors.push('Invalid asset code.');
      return errors;
    },
  },

  methods: {
    onSubmit () {
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }
      this.$emit('addAssetCode', { assetCode: this.newAssetCode, publicKey: this.data.public_key });
      this.newAssetCode = '';
      this.$v.$reset();
    },

    onDelete (assetCode, publicKey) {
      this.$root.$confirm('Delete', 'Are you sure you want to delete the asset?', { color: 'red', action: 'Delete' }).then(async confirm => {
        if (confirm) {
          this.$emit('deleteAssetCode', { assetCode, publicKey });
        }
      });
    },
    onCancel () {
      this.newAssetCode = '';
      this.$v.$reset();
      this.$emit('reset');
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
