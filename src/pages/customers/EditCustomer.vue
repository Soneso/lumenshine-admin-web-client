<template>
  <v-flex v-if="customerData" xs12 sm12>
    <v-container v-if="currentPage === 'details'">
      <v-progress-linear v-if="loadingDetails" :indeterminate="true"/>
      <v-subheader class="headline">
        Personal data
        <v-spacer/>
      </v-subheader>
      <div v-if="detailsErrorMessages.length > 0">
        <v-subheader v-for="error in detailsErrorMessages" :key="error.error_code" class="error">{{ error.error_message }}</v-subheader>
      </div>
      <v-layout row justify-space-between>
        <v-flex xs6 sm6>
          <p>Forename: {{ customerData.forename }}</p>
          <p>Last name: {{ customerData.last_name }}</p>
          <p>Customer ID: {{ customerData.id }}</p>
        </v-flex>
        <v-flex xs6 sm6>
          <p>Email: {{ customerData.email }}</p>
          <p>Mobile phone number: {{ customerData.mobile_nr }}</p>
          <p>
            Address: <span v-html="address"/>
          </p>
        </v-flex>
      </v-layout>
      <v-layout row justify-space-between>
        <v-flex xs6 sm6>
          <p>Nationality: {{ customerData.nationality }}</p>
          <p>Birth date: {{ customerData.birth_day && dayjs(customerData.birth_day).format('DD MMM YYYY') }}</p>
          <p>Birth place: {{ customerData.birth_place }}</p>
        </v-flex>
        <v-flex xs6 sm6>
          <p>Registration date: {{ customerData.registration_date && dayjs(customerData.registration_date).format('DD MMM YYYY') }}</p>
        </v-flex>
      </v-layout>
      <customer-reset-tfa-form
        :data="customerData"
        :loading="loadingReset2fa"
        @reset="reset2fa"/>
    </v-container>
  </v-flex>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import dayjs from 'dayjs';
import ApiUrls from '@/services/apiUrls';

import CustomerResetTfaForm from '@/forms/CustomerResetTfaForm';

export default {
  name: 'EditCustomer',
  components: { CustomerResetTfaForm },
  data () {
    return {
      detailsErrorMessages: [],

      loadingReset2fa: false,
    };
  },
  computed: {
    ...mapGetters(['customer', 'customerListStatus']),
    address () {
      const parts = [];
      parts.push(this.customerData.address);
      this.customerData.zip_code && parts.push(`, ${this.customerData.zip_code}`);
      this.customerData.city && parts.push('<br>');
      this.customerData.city && parts.push(this.customerData.city);
      this.customerData.state && parts.push(`, ${this.customerData.state},`);
      this.customerData.country_code && parts.push('<br>');
      this.customerData.country_code && parts.push(this.customerData.country_code);
      return parts.join('');
    },
    customerData () {
      return this.customer(this.$route.params.id);
    },
    currentPage () {
      return this.$route.params.page || 'details';
    },
    loadingDetails () {
      return this.customerListStatus.loading;
    }
  },
  async created () {
    await this.getCustomerDetails(this.$route.params.id);
  },
  methods: {
    ...mapActions(['getCustomerDetails']),
    dayjs,
    async reset2fa () {
      this.loadingReset2fa = true;
      await this.$http({
        url: ApiUrls.Customers.Reset2FA,
        method: 'POST',
        data: {
          id: this.customerData.id,
        }
      });
      this.loadingReset2fa = false;
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
