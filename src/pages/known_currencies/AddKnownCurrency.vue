<template>
  <v-flex xs12 sm12>
    <v-container row justify-space-between>
      <v-progress-linear v-if="loading" :indeterminate="true"/>
      <v-subheader class="headline">
        Add known currency
      </v-subheader>
      <div v-if="errorMessages.length > 0">
        <v-subheader v-for="error in errorMessages" :key="error.error_code" class="error">{{ error.error_message }}</v-subheader>
      </div>
      <known-currency-form :password-field-shown="true" @submit="submitForm" @cancel="onCancelClick"/>
    </v-container>
  </v-flex>
</template>

<script>
import ApiUrls from '@/services/apiUrls';

import { mapActions } from 'vuex';

import KnownCurrencyForm from '@/forms/KnownCurrencyForm';

export default {
  name: 'AddKnownCurrency',
  components: { KnownCurrencyForm },
  data () {
    return {
      loading: false,

      errorMessages: [],
    };
  },
  methods: {
    ...mapActions(['getKnownCurrenciesList']),
    async submitForm (data) {
      this.errorMessages = [];
      this.loading = true;
      try {
        await this.$http({
          url: ApiUrls.KnownCurrencies.AddCurrency,
          method: 'POST',
          data
        });
        await this.getKnownCurrenciesList();
        this.$router.push({ path: '/known_currencies' });
      } catch (err) {
        this.errorMessages = err.response.data;
        this.loading = false;
      }
      this.loading = false;
    },
    onCancelClick () {
      this.$router.push({ path: '/known_currencies' });
    },
  }
};
</script>

<style lang="scss" scoped>
</style>
