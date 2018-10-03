<template>
  <v-flex xs12 sm12>
    <v-container justify-space-between>
      <v-subheader class="headline">
        Search customers
        <v-spacer/>
        <v-btn @click="onRefresh">Refresh</v-btn>
      </v-subheader>
      <v-layout row justify-space-between>
        <v-flex xs3 sm3>
          <v-text-field
            v-model="forenameFilter"
            label="Forename"
            hide-details
            persistent-hint
          />
          <v-text-field
            v-model="lastnameFilter"
            label="Last name"
            hide-details
            persistent-hint
          />
        </v-flex>
        <v-flex xs3 sm3>
          <v-text-field
            v-model="emailFilter"
            label="Email"
            hide-details
          />
          <v-text-field
            v-model="idFilter"
            label="Customer ID"
            hide-details
          />
        </v-flex>
        <v-flex xs2 sm2>
          KYC Status<br>
          <v-checkbox
            v-model="statusWaitingDataFilter"
            label="Waiting for data"
          />
          <v-checkbox
            v-model="statusWaitingReviewFilter"
            label="Waiting for review"
          />
          <v-checkbox
            v-model="statusInReviewFilter"
            label="In review"
          />
        </v-flex>
        <v-flex xs2 sm2>
          <v-checkbox
            v-model="statusPendingFilter"
            label="Pending"
          />
          <v-checkbox
            v-model="statusApprovedFilter"
            label="Approved"
          />
          <v-checkbox
            v-model="statusRejectedFilter"
            label="Rejected"
          />
        </v-flex>
      </v-layout>
      <v-data-table
        :headers="headers"
        :items="extendedItems"
        :loading="customerListStatus.loading"
        :pagination.sync="pagination"
        :total-items="customerTotalItems"
        class="elevation-1">
        <template slot="items" slot-scope="props">
          <tr @click="editCustomer(props.item.id)">
            <td>{{ props.item.forename }}</td>
            <td>{{ props.item.last_name }}</td>
            <td><a :href="`mailto:${props.item.email}`" target="_blank">{{ props.item.email }}</a></td>
            <td>{{ props.item.id }}</td>
            <td>{{ statusText[props.item.kyc_status] }}</td>
            <td>{{ props.item.formatted_date }}</td>
          </tr>
        </template>
      </v-data-table>
    </v-container>
  </v-flex>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import dayjs from 'dayjs';
import _ from 'lodash';

const statusText = {
  not_supported: 'Not supported',
  waiting_for_data: 'Waiting for data',
  waiting_for_review: 'Waiting for review',
  in_review: 'In review',
  pending: 'Pending',
  rejected: 'Rejected',
  approved: 'Approved',
};

export default {
  name: 'CustomerList',
  data () {
    return {
      forenameFilter: '',
      lastnameFilter: '',
      emailFilter: '',
      idFilter: '',

      statusWaitingDataFilter: true,
      statusWaitingReviewFilter: true,
      statusInReviewFilter: true,
      statusPendingFilter: true,
      statusApprovedFilter: true,
      statusRejectedFilter: true,

      pagination: {},

      headers: [
        { text: 'Forename', align: 'left', value: 'forename' },
        { text: 'Last name', align: 'left', value: 'last_name' },
        { text: 'Email', align: 'left', value: 'email' },
        { text: 'Customer ID', value: 'id' },
        { text: 'KYC Status', value: 'kyc_status' },
        { text: 'Registration date', value: 'formatted_date' }
      ],
      statusText,
    };
  },
  computed: {
    ...mapGetters(['customerListStatus', 'customerList', 'customerTotalItems']),
    extendedItems () {
      if (!this.customerList) return [];
      return this.customerList.map(customer => ({
        ...customer,
        formatted_date: dayjs(customer.registration_date).format('DD MMM YYYY'),
      }));
    },
    kycStatus () {
      const status = [
        ...(this.statusWaitingDataFilter ? ['waiting_for_data'] : []),
        ...(this.statusWaitingReviewFilter ? ['waiting_for_review'] : []),
        ...(this.statusInReviewFilter ? ['in_review'] : []),
        ...(this.statusPendingFilter ? ['pending'] : []),
        ...(this.statusApprovedFilter ? ['approved'] : []),
        ...(this.statusRejectedFilter ? ['rejected'] : []),
      ];
      return status;
    }
  },
  watch: {
    pagination: {
      handler () {
        this.debouncedLoadData();
      },
      deep: true
    },
    forenameFilter () { this.debouncedLoadData(); },
    lastnameFilter () { this.debouncedLoadData(); },
    emailFilter () { this.debouncedLoadData(); },
    idFilter () { this.debouncedLoadData(); },
    kycStatus () { this.debouncedLoadData(); },
  },
  created () {
    this.loadNewData();
    this.debouncedLoadData = _.debounce(this.loadNewData, 400);
  },
  methods: {
    ...mapActions(['getCustomerList']),
    editCustomer (id) {
      this.$router.push({ path: `/customers/${id}` });
    },
    onRefresh () {
      this.loadNewData();
    },
    async loadNewData () {
      const { sortBy, descending, page, rowsPerPage } = this.pagination;
      const sortDirection = descending ? 'desc' : 'asc';
      const sortType = {
        ...(sortBy === 'id' ? { sort_customer_id: sortDirection } : {}),
        ...(sortBy === 'forename' ? { sort_forename: sortDirection } : {}),
        ...(sortBy === 'lastname' ? { sort_lastname: sortDirection } : {}),
        ...(sortBy === 'email' ? { sort_email: sortDirection } : {}),
        ...(sortBy === 'formatted_date' ? { sort_registration_date: sortDirection } : {}),
      };
      await this.getCustomerList({
        page_number: page,
        per_page_count: rowsPerPage,
        ...(this.idFilter !== '' ? { filter_customer_id: this.idFilter } : {}),
        ...(this.forenameFilter !== '' ? { filter_forname: this.forenameFilter } : {}),
        ...(this.lastnameFilter !== '' ? { filter_lastname: this.lastnameFilter } : {}),
        ...(this.emailFilter !== '' ? { filter_email: this.emailFilter } : {}),
        ...(this.kycStatus.length > 0 ? { filter_kyc_status: this.kycStatus } : {}),
        ...sortType,
      });
    }
  }
};
</script>

<style lang="scss" scoped>
td.public-key {
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
