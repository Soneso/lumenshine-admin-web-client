<template>
  <v-flex xs12 sm12>
    <v-container justify-space-between>
      <v-subheader class="headline">
        Stellar Accounts
        <v-spacer/>
        <v-btn @click="onRefresh">Refresh</v-btn>
      </v-subheader>
      <v-flex xs9 sm9>
        <v-layout row>
          <v-text-field
            v-model="nameFilter"
            append-icon="search"
            label="Name"
            hide-details
            persistent-hint
          />
          <v-spacer/>
          <v-select
            :items="typeItems"
            v-model="typeFilter"
            label="Type"
          />
        </v-layout>
        <v-layout row>
          <v-text-field
            v-model="publicKeyFilter"
            append-icon="search"
            label="Public key"
            hide-details
          />
          <!-- <v-select
            :items="networkItems"
            v-model="networkFilter"
            label="Network"
          /> -->
        </v-layout>
        <br><br>
      </v-flex>
      <v-data-table
        :headers="headers"
        :items="filteredItems"
        :loading="accountListStatus.loading"
        hide-actions
        class="elevation-1">
        <template slot="items" slot-scope="props">
          <tr @click="editAccount(props.item.public_key)">
            <td>{{ props.item.name }}</td>
            <td class="public-key">
              {{ props.item.public_key }}
              <a
                v-clipboard:copy="props.item.public_key"
                v-clipboard:success="() => onCopy(props.item.public_key)"
                class="wallet-link"
                @click="stopPropagation">
                <v-icon>file_copy</v-icon>
              </a>
              <span v-if="props.item.public_key === copiedAccount">Copied</span>
            </td>
            <td class="text-xs-right">{{ props.item.type }}</td>
            <!-- <td class="text-xs-right">{{ props.item.network }}</td> -->
            <td class="text-xs-right" v-html="props.item.balances"/>
          </tr>
        </template>
      </v-data-table>
    </v-container>
  </v-flex>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'AccountList',
  data () {
    return {
      pagination: {
        sortBy: 'type'
      },
      headers: [
        { text: 'Name', align: 'left', value: 'name' },
        { text: 'Public key', align: 'left', value: 'public_key' },
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
      copiedAccount: null,
    };
  },
  computed: {
    ...mapGetters(['accountListStatus', 'accountList']),
    extendedItems () {
      if (!this.accountList) return [];
      return this.accountList.map(account => Object.assign({}, account, {
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
    },
    onCopy (account) {
      this.copiedAccount = account;
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
