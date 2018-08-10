<template>
  <v-flex xs12 sm6>
    <v-card>
      <v-progress-linear v-if="loading" :indeterminate="true"/>
      <v-card-title>
        Add known currency
        <v-spacer/>
      </v-card-title>
      <v-container row justify-space-between>
        <div v-if="errorMessages.length > 0">
          <v-subheader v-for="error in errorMessages" :key="error.error_code" class="error">{{ error.error_message }}</v-subheader>
        </div>
        <known-currency-form :password-field-shown="true" @submit="submitForm" @cancel="onCancelClick"/>
      </v-container>
    </v-card>
  </v-flex>
</template>

<script>
import { Urls } from '@/router/urls';

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
          url: Urls.KnownCurrencies.AddCurrency,
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
