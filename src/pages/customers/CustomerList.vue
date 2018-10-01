<template>
  <v-flex xs12 sm12>
    <v-container justify-space-between>
      <v-subheader class="headline">
        Search customers
        <v-spacer/>
        <v-btn @click="onRefresh">Refresh</v-btn>
      </v-subheader>
      <v-layout row>
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
        <v-flex xs3 sm3>
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
        <v-flex xs3 sm3>
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
        :items="filteredItems"
        :loading="customerListStatus.loading"
        hide-actions
        class="elevation-1">
        <template slot="items" slot-scope="props">
          <tr @click="editAccount(props.item.public_key)">
            <td>{{ props.item.full_name }}</td>
            <td>{{ props.item.email }}</td>
            <td>{{ props.item.id }}</td>
            <td>{{ props.item.kyc_status }}</td>
            <td>{{ props.item.registration_date }}</td>
          </tr>
        </template>
      </v-data-table>
    </v-container>
  </v-flex>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

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

      pagination: {
        sortBy: 'type'
      },

      headers: [
        { text: 'Forename / Last name', align: 'left', value: 'full_name' },
        { text: 'Email', align: 'left', value: 'email' },
        { text: 'Customer ID', value: 'id' },
        { text: 'KYC Status', value: 'kyc_status' },
        { text: 'Registration date', value: 'registration_date' }
      ],
    };
  },
  computed: {
    ...mapGetters(['customerListStatus', 'customerList']),
    extendedItems () {
      if (!this.customerList) return [];
      return this.customerList.map(customer => ({
        ...customer,
        full_name: `${customer.forename} ${customer.last_name}`,
      }));
    },
    filteredItems () {
      return this.extendedItems.filter(item => {
        if (this.forenameFilter !== '' && item.forename.indexOf(this.forenameFilter) === -1) return false;
        if (this.lastnameFilter !== '' && item.last_name.indexOf(this.lastnameFilter) === -1) return false;
        if (this.emailFilter !== '' && item.email.indexOf(this.emailFilter) === -1) return false;
        if (this.idFilter !== '' && `${item.id}` !== this.idFilter) return false;
        return true;
      });
    }
  },
  created () {
    this.getCustomerList();
  },
  methods: {
    ...mapActions(['getCustomerList']),
    editCustomer (pk) {
      this.$router.push({ path: `customers/${pk}` });
    },
    onRefresh () {
      this.getCustomerList();
    },
    stopPropagation (e) {
      e.stopPropagation();
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
