<template>
  <v-flex xs12 sm12>
    <v-container row justify-space-between>
      <v-progress-linear v-if="loading" :indeterminate="true"/>
      <v-subheader class="headline">
        Add known inflation destination
      </v-subheader>
      <div v-if="errorMessages.length > 0">
        <v-subheader v-for="error in errorMessages" :key="error.error_code" class="error">{{ error.error_message }}</v-subheader>
      </div>
      <known-inflation-destination-form :password-field-shown="true" @submit="submitForm" @cancel="onCancelClick"/>
    </v-container>
  </v-flex>
</template>

<script>
import { Urls } from '@/router/urls';

import { mapActions } from 'vuex';

import KnownInflationDestinationForm from '@/forms/KnownInflationDestinationForm';

export default {
  name: 'AddKnownInflationDestination',
  components: { KnownInflationDestinationForm },
  data () {
    return {
      loading: false,

      errorMessages: [],
    };
  },
  methods: {
    ...mapActions(['getKnownInflationDestinationsList']),
    async submitForm (data) {
      this.errorMessages = [];
      this.loading = true;
      try {
        await this.$http({
          url: Urls.KnownInflationDestinations.AddInflationDestination,
          method: 'POST',
          data
        });
        await this.getKnownInflationDestinationsList();
        this.$router.push({ path: '/known_inflation_destinations' });
      } catch (err) {
        this.errorMessages = err.response.data;
        this.loading = false;
      }
      this.loading = false;
    },
    onCancelClick () {
      this.$router.push({ path: '/known_inflation_destinations' });
    },
  }
};
</script>

<style lang="scss" scoped>
</style>
