<template>
  <v-flex xs12 sm12>
    <v-card>
      <v-progress-linear v-if="loading" :indeterminate="true"/>
      <v-card-title>
        Edit known currency
        <v-spacer/>
      </v-card-title>
      <v-container v-if="knownCurrencyData" row justify-space-between>
        <div v-if="errorMessages.length > 0">
          <v-subheader v-for="error in errorMessages" :key="error.error_code" class="error">{{ error.error_message }}</v-subheader>
        </div>
        <v-btn @click="deleteCurrency">Delete</v-btn>
        <known-currency-form :data="knownCurrencyData" @submit="submitForm" @cancel="onCancelClick"/>
      </v-container>
    </v-card>
  </v-flex>
</template>

<script>
import { mapActions } from 'vuex';

import { Urls } from '@/router/urls';

import KnownCurrencyForm from '@/forms/KnownCurrencyForm';

export default {
  name: 'EditKnownCurrency',
  components: { KnownCurrencyForm },
  data () {
    return {
      loading: false,

      knownCurrencyData: null,
      errorMessages: [],
    };
  },
  async created () {
    this.loading = true;
    try {
      const res = await this.$http({
        url: `${Urls.KnownCurrencies.GetCurrency}/${this.$route.params.id}`,
        method: 'GET'
      });
      this.knownCurrencyData = res.data;
      // this is needed because there are different names in the response from the vue app
      this.knownCurrencyData.issuerPublicKey = res.data.issuer_public_key;
      this.knownCurrencyData.assetCode = res.data.asset_code;
      this.knownCurrencyData.shortDescription = res.data.short_description;
      this.knownCurrencyData.longDescription = res.data.long_description;
    } catch (err) {
      this.loading = false;
    }
    this.loading = false;
  },
  methods: {
    ...mapActions(['getKnownCurrenciesList']),
    async submitForm (data) {
      this.loading = true;
      this.errorMessages = [];
      try {
        await this.$http({
          url: Urls.KnownCurrencies.EditCurrency,
          method: 'POST',
          data: {
            id: parseInt(this.$route.params.id, 10),
            name: data.name,
            issuer_public_key: data.issuer_public_key,
            asset_code: data.asset_code,
            short_description: data.short_description,
            long_description: data.long_description,
          }
        });
        await this.getKnownCurrenciesList();
        this.$router.push({ path: '/known_currencies' });
      } catch (err) {
        this.errorMessages = err.response.data;
        this.loading = false;
      }
      this.loading = false;
    },
    async deleteCurrency () {
      if (confirm('Delete this currency?')) {
        this.loading = true;
        this.errorMessages = [];
        try {
          await this.$http({
            url: Urls.KnownCurrencies.DeleteCurrency,
            method: 'POST',
            data: {
              id: parseInt(this.$route.params.id, 10),
            }
          });
          await this.getKnownCurrenciesList();
          this.$router.push({ path: '/known_currencies' });
        } catch (err) {
          this.errorMessages = err.response.data;
          this.loading = false;
        }
        this.loading = false;
      }
    },
    onCancelClick () {
      this.$router.push({ path: '/known_currencies' });
    },
  }
};
</script>

<style lang="scss" scoped>
</style>
