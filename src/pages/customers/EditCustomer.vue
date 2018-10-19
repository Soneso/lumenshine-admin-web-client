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
          <p>Last name: {{ customerData.lastname }}</p>
          <p v-if="customerData.additional_name">Additional name: {{ customerData.additional_name }}</p>
          <p>Customer ID: {{ customerData.id }}</p>
          <p v-if="customerData.title">Title: {{ customerData.title }}</p>
        </v-flex>
        <v-flex xs6 sm6>
          <p>Email: {{ customerData.email }}</p>
          <p v-if="customerData.mobile_nr">Mobile phone number: {{ customerData.mobile_nr }}</p>
          <p v-if="address">Address: <span v-html="address"/></p>
        </v-flex>
      </v-layout>
      <v-layout row justify-space-between>
        <v-flex xs6 sm6>
          <p v-if="customerData.bank_account_number">Bank account number: {{ customerData.bank_account_number }}</p>
          <p v-if="customerData.bank_number">Bank number: {{ customerData.bank_number }}</p>
          <p v-if="customerData.bank_phone_number">Bank phone number: {{ customerData.bank_phone_number }}</p>
        </v-flex>
        <v-flex xs6 sm6>
          <p v-if="customerData.company">Company: {{ customerData.company }}</p>
          <p v-if="customerData.employer_name">Employer name: {{ customerData.employer_name }}</p>
          <p v-if="customerData.employer_address">Employer address: {{ customerData.employer_address }}</p>
        </v-flex>
      </v-layout>
      <v-layout row justify-space-between>
        <v-flex xs6 sm6>
          <p v-if="customerData.language_code">Language code: {{ customerData.language_code }}</p>
          <p v-if="customerData.occupation">Occupation: {{ customerData.occupation }}</p>
          <p v-if="customerData.salutation">Salutation: {{ customerData.salutation }}</p>
        </v-flex>
        <v-flex xs6 sm6>
          <p v-if="customerData.tax_id">Tax ID: {{ customerData.tax_id }}</p>
          <p v-if="customerData.tax_id_name">Tax ID name: {{ customerData.tax_id_name }}</p>
        </v-flex>
      </v-layout>
      <v-layout row justify-space-between>
        <v-flex xs6 sm6>
          <p v-if="customerData.nationality">Nationality: {{ customerData.nationality }}</p>
          <p v-if="customerData.birth_day">Birth date: {{ dayjs(customerData.birth_day).format('DD MMM YYYY') }}</p>
          <p v-if="customerData.birth_place">Birth place: {{ customerData.birth_place }} {{ customerData.birth_country_code }}</p>
        </v-flex>
        <v-flex xs6 sm6>
          <p>Registration date: {{ customerData.registration_date && dayjs(customerData.registration_date).format('DD MMM YYYY') }}</p>
        </v-flex>
      </v-layout>
      <customer-reset-tfa-form
        :data="customerData"
        :loading="loadingReset2fa"
        @reset="reset2fa"/>
      <customer-edit-data
        v-if="customerData"
        :customer="customerData"
        :loading="loadingEdit"
        @reset="editCustomer"/>
    </v-container>
  </v-flex>
</template>
<script>
import { mapActions, mapGetters } from 'vuex';
import dayjs from 'dayjs';
import ApiUrls from '@/services/apiUrls';

import CustomerEditData from '@/forms/customers/CustomerEditData';
import CustomerResetTfaForm from '@/forms/customers/CustomerResetTfaForm';

export default {
  name: 'EditCustomer',
  components: { CustomerResetTfaForm, CustomerEditData },
  data () {
    return {
      detailsErrorMessages: [],

      loadingReset2fa: false,
      loadingEdit: false,
    };
  },
  computed: {
    ...mapGetters(['customer', 'customerListStatus', 'occupations', 'languages', 'salutations', 'countries']),
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
  created () {
    this.loadStaticData();
    this.getCustomerDetails(this.$route.params.id);
  },
  methods: {
    ...mapActions(['getCustomerDetails', 'loadStaticData']),
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
    },
    async editCustomer (data) {
      this.loadingEdit = true;
      await this.$http({
        url: ApiUrls.Customers.EditCustomer,
        method: 'POST',
        data,
      });
      this.loadingEdit = false;
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
