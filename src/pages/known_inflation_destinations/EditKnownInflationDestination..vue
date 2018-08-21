<template>
  <v-flex xs12 sm12>
    <v-container v-if="knownInflationDestinationData" row justify-space-between>
      <v-progress-linear v-if="loading" :indeterminate="true"/>
      <v-subheader class="headline">
        Edit known inflation destination
        <v-spacer/>
        <v-btn @click="deleteInflationDestination">Delete</v-btn>
      </v-subheader>
      <div v-if="errorMessages.length > 0">
        <v-subheader v-for="error in errorMessages" :key="error.error_code" class="error">{{ error.error_message }}</v-subheader>
      </div>
      <known-inflation-destination-form :data="knownInflationDestinationData" @submit="submitForm" @cancel="onCancelClick"/>
    </v-container>
  </v-flex>
</template>

<script>
import { mapActions } from 'vuex';

import { Urls } from '@/router/urls';

import KnownInflationDestinationForm from '@/forms/KnownInflationDestinationForm';

export default {
  name: 'EditKnownInflationDestination',
  components: { KnownInflationDestinationForm },
  data () {
    return {
      loading: false,

      knownInflationDestinationData: null,
      errorMessages: [],
    };
  },
  async created () {
    this.loading = true;
    try {
      const res = await this.$http({
        url: `${Urls.KnownInflationDestinations.GetInflationDestination}/${this.$route.params.id}`,
        method: 'GET'
      });
      this.knownInflationDestinationData = res.data;
      // this is needed because there are different names in the response from the vue app
      this.knownInflationDestinationData.issuerPublicKey = res.data.issuer_public_key;
      this.knownInflationDestinationData.shortDescription = res.data.short_description;
      this.knownInflationDestinationData.longDescription = res.data.long_description;
    } catch (err) {
      this.loading = false;
    }
    this.loading = false;
  },
  methods: {
    ...mapActions(['getKnownInflationDestinationsList']),
    async submitForm (data) {
      this.loading = true;
      this.errorMessages = [];
      try {
        await this.$http({
          url: Urls.KnownCurrencies.EditInflationDestination,
          method: 'POST',
          data: {
            id: parseInt(this.$route.params.id, 10),
            name: data.name,
            issuer_public_key: data.issuer_public_key,
            short_description: data.short_description,
            long_description: data.long_description,
          }
        });
        await this.getKnownInflationDestinationsList();
        this.$router.push({ path: '/known_inflation_destinations' });
      } catch (err) {
        this.errorMessages = err.response.data;
        this.loading = false;
      }
      this.loading = false;
    },
    async deleteInflationDestination () {
      if (confirm('Delete this inflation destination?')) {
        this.loading = true;
        this.errorMessages = [];
        try {
          await this.$http({
            url: Urls.KnownInflationDestinations.DeleteInflationDestination,
            method: 'POST',
            data: {
              id: parseInt(this.$route.params.id, 10),
            }
          });
          await this.getKnownInflationDestinationsList();
          this.$router.push({ path: '/known_inflation_destinations' });
        } catch (err) {
          this.errorMessages = err.response.data;
          this.loading = false;
        }
        this.loading = false;
      }
    },
    onCancelClick () {
      this.$router.push({ path: '/known_inflation_destinations' });
    },
  }
};
</script>

<style lang="scss" scoped>
</style>
