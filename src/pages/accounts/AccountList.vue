<template>
  <v-flex xs12 sm6>
    <v-card>
      <v-card-title>
        Accounts
        <v-spacer/>
        <v-btn @click="onRefresh">Refresh</v-btn>
      </v-card-title>
      <v-container justify-space-between>
        Filters
        <v-layout row>
          <v-text-field
            v-model="nameFilter"
            append-icon="search"
            label="Name"
            hide-details
          />
          <v-spacer/>
          <v-text-field
            v-model="publicKeyFilter"
            append-icon="search"
            label="Public key"
            hide-details
          />
          <v-spacer/>
          <v-select
            :items="typeItems"
            v-model="typeFilter"
            label="Type"
          />
          <!-- <v-select
            :items="networkItems"
            v-model="networkFilter"
            label="Network"
          /> -->
        </v-layout>
      </v-container>
      <v-data-table
        :headers="headers"
        :items="filteredItems"
        :loading="accountListStatus.loading"
        hide-actions
        class="elevation-1"
      >
        <template slot="items" slot-scope="props">
          <tr @click="editAccount(props.item.public_key)">
            <td v-html="props.item.nameAndPublicKey"/>
            <td class="text-xs-right">{{ props.item.type }}</td>
            <!-- <td class="text-xs-right">{{ props.item.network }}</td> -->
            <td class="text-xs-right" v-html="props.item.balances"/>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </v-flex>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'AccountList',
  data () {
    return {
      headers: [
        { text: 'Name / Public key', align: 'left', value: 'nameAndPublicKey' },
        { text: 'Type', value: 'type' },
        // { text: 'Network', value: 'network' },
        { text: 'Balances', value: 'balanceXLM' }
      ],

      nameFilter: '',
      publicKeyFilter: '',
      // networkFilter: false,
      typeFilter: null,

      typeItems: [
        { text: 'All', value: null },
        { text: 'Funding', value: 'funding' },
        { text: 'Issuing', value: 'issuing' },
        { text: 'Worker', value: 'worker' },
      ],

      // networkItems: [
      //   { text: 'Funding' },
      // ]

    };
  },
  computed: {
    ...mapGetters(['accountListStatus', 'accountList']),
    extendedItems () {
      if (!this.accountList) return [];
      return this.accountList.map(account => Object.assign({}, account, {
        nameAndPublicKey: `${account.name}<br>${account.public_key.slice(0, 15)}...`,
        balances: account.balances ? this.formatBalances(account).join(', ') : 'Account not funded',
      }));
    },
    filteredItems () {
      return this.extendedItems.filter(item => {
        if (this.nameFilter !== '' && item.name.indexOf(this.nameFilter) === -1) return false;
        if (this.publicKeyFilter !== '' && item.public_key.indexOf(this.publicKeyFilter) === -1) return false;
        if (this.typeFilter !== null && item.type !== this.typeFilter) return false;
        return true;
      });
    }
  },
  created () {
    this.getAccountList();
  },
  methods: {
    ...mapActions(['getAccountList']),
    editAccount (pk) {
      this.$router.push({ path: `accounts/${pk}` });
    },
    formatBalances (account) {
      if (!account.balances) return [];
      const xlmBalance = `${account.balances.find(b => b.asset_type === 'native').balance} XLM`;

      const otherBalances = account.balances.filter(b => b.asset_type !== 'native');
      otherBalances.map(bal => `${bal.balance} ${bal.asset_code}`);
      return [xlmBalance, ...otherBalances.map(bal => `${bal.balance} ${bal.asset_code}`)];
    },
    onRefresh () {
      this.getAccountList();
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
