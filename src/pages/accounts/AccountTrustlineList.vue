<template>
  <v-flex xs12 sm12>
    <v-container justify-space-between>
      <v-layout row>
        <v-flex xs9 sm9>
          <v-layout row>
            <v-text-field
              v-model="assetCode"
              append-icon="search"
              label="Asset code"
              hide-details
              persistent-hint
            />
          </v-layout>
          <v-layout row>
            <v-text-field
              v-model="issuer"
              append-icon="search"
              label="Issuer name"
              hide-details
              persistent-hint
            />
          </v-layout>
          <v-layout row>
            <v-text-field
              v-model="issuerPublicKey"
              append-icon="search"
              label="Issuer public key"
              hide-details
              persistent-hint
            />
          </v-layout>
          <br>
        </v-flex>
        <v-flex xs3 sm3>
          Status<br>
          <v-checkbox
            v-model="authOk"
            label="OK"
          />
          <v-checkbox
            v-model="waitingAuth"
            label="Waiting for authorization"
          />
          <v-checkbox
            v-model="denied"
            label="Denied"
          />
          <v-checkbox
            v-model="revoked"
            label="Revoked"
          />
        </v-flex>
      </v-layout>
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

import ApiUrls from '@/services/apiUrls';

export default {
  name: 'AccountTrustlineList',
  props: {
    data: {
      type: Object,
      default: () => ({})
    },
  },
  data () {
    return {
      pagination: {
        sortBy: 'type'
      },
      headers: [
        { text: 'Issuer name/public key', align: 'left', value: 'name' },
        { text: 'Asset code', align: 'left', value: 'asset_code' },
        { text: 'Status', value: 'status' },
        { text: '', value: 'actions' },
      ],

      nameFilter: '',
      publicKeyFilter: '',

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
  async created () {
    await this.$http({
      url: ApiUrls.Accounts.SearchTrustingAccounts,
      method: 'GET',
      params: {
        issuing_account_public_key: this.data.public_key,
        asset_code: 'XLM',
        // filter_name: ''
        // filter_public_key
        filter_type: 'worker',
        // filter_statuses
        page_number: 0,
        per_page_count: 20,
      }
    });
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
