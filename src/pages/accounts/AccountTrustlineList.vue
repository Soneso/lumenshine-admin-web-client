<template>
  <div>
    <br>
    <strong v-if="data.type === 'issuing'">Trusting accounts</strong>
    <strong v-if="data.type === 'worker'">Trustlines</strong>
    <a v-if="data.type === 'worker'" href="#" @click.prevent="onOpenForm('add')">add</a>
    <br>
    <v-layout row justify-space-between align-content-space-between>
      <v-flex v-if="data.type === 'issuing'" xs6 sm6>
        <v-text-field
          v-model="filterPublicKey"
          label="Public key"
          hide-details
          persistent-hint
        />
        <v-text-field
          v-model="filterWorkerAccount"
          label="Name of worker account"
          hide-details
          persistent-hint
        />
        <v-select
          :items="assetCodeItems"
          v-model="filterAssetCode"
          label="Asset code"
          persistent-hint
        />
      </v-flex>
      <v-flex v-if="data.type === 'worker'" xs6 sm6>
        <v-text-field
          v-model="filterAssetCodeName"
          label="Asset code"
          hide-details
          persistent-hint
        />
        <v-text-field
          v-model="filterIssuerName"
          label="Issuer name"
          hide-details
          persistent-hint
        />
        <v-text-field
          v-model="filterIssuerPublicKey"
          label="Issuer public key"
          hide-details
          persistent-hint
        />
      </v-flex>
      <v-flex v-if="data.type === 'issuing'" xs2 sm2>
        Type<br>
        <v-checkbox
          v-model="showWorker"
          label="Worker"
        />
        <v-checkbox
          v-model="showCustomer"
          label="Customer"
        />
      </v-flex>
      <v-flex xs3 sm3>
        Status<br>
        <v-checkbox
          v-model="showAuthOk"
          label="OK"
        />
        <v-checkbox
          v-model="showWaitingAuth"
          label="Waiting for authorization"
        />
        <v-checkbox
          v-model="showDenied"
          label="Denied"
        />
        <v-checkbox
          v-model="showRevoked"
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
          <td>
            {{ props.item.name }} {{ props.item.public_key }}
            <a
              v-clipboard:copy="props.item.public_key"
              v-clipboard:success="() => onCopy(props.item.public_key)"
              class="wallet-link"
              @click="stopPropagation">
              <v-icon>file_copy</v-icon>
            </a>
            <span v-if="props.item.public_key === copiedAccount">Copied</span>
          </td>
          <td>{{ props.item.asset_code }}</td>
          <td>{{ props.item.type }}</td>
          <td>{{ props.item.status }}</td>
          <td>
            <a v-if="data.type === 'worker'" href="#" class="warning-text" @click.prevent="onOpenForm('remove', props.item)">Remove</a><br>
            <a v-if="props.item.status !== 'OK' && data.type === 'issuing'" href="#" @click.prevent="onOpenForm('authorize', props.item)">Authorize</a><br>
            <a v-if="['Denied', 'Revoked'].includes(props.item.status)" href="#" @click.prevent="onOpenForm('reason', props.item)">Reason</a><br>
            <a v-if="props.item.status === 'Waiting for authorization' && data.type === 'issuing'" href="#" class="warning-text" @click.prevent="onOpenForm('deny', props.item)">Deny auth</a><br>
            <a href="#">Go to account</a><br>
          </td>
        </tr>
      </template>
    </v-data-table>
    <account-auth-trustline-form
      v-if="['authorize', 'deny', 'revoke'].includes(openedForm)"
      :type="openedForm"
      :loading="loading"
      :requester="openedAccount"
      :data="data"
      :errors="errors"
      @authorizeTrustline="params => $emit('authorizeTrustline', params)"
      @reset="openedForm = null"
    />
    <account-add-remove-trustline-form
      v-if="['add', 'remove'].includes(openedForm)"
      :type="openedForm"
      :loading="loading"
      :requester="openedAccount"
      :issuing-accounts="issuingAccounts"
      :data="data"
      :errors="errors"
      @addTrustline="params => $emit('addTrustline', params)"
      @removeTrustline="params => $emit('removeTrustline', params)"
      @reset="openedForm = null"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import ApiUrls from '@/services/apiUrls';

import AccountAuthTrustlineForm from '@/forms/AccountAuthTrustlineForm';
import AccountAddRemoveTrustlineForm from '@/forms/AccountAddRemoveTrustlineForm';

export default {
  name: 'AccountTrustlineList',
  components: { AccountAuthTrustlineForm, AccountAddRemoveTrustlineForm },
  props: {
    data: {
      type: Object,
      default: () => ({})
    },
    loading: {
      type: Boolean,
      required: true,
    },
    issuingAccounts: {
      type: Array,
      required: true,
    }
  },
  data () {
    return {
      pagination: {
        sortBy: 'type'
      },
      headers: [
        { text: 'Name/Public key', align: 'left', value: 'name' },
        { text: 'Asset code', align: 'left', value: 'asset_code' },
        { text: 'Type', value: 'type' },
        { text: 'Status', value: 'status' },
        { text: '', value: 'actions' },
      ],

      filterPublicKey: '',
      filterWorkerAccount: '',
      filterAssetCode: '',

      filterAssetCodeName: '',
      filterIssuerName: '',
      filterIssuerPublicKey: '',

      showWorker: true,
      showCustomer: true,

      showAuthOk: true,
      showWaitingAuth: true,
      showDenied: true,
      showRevoked: true,

      openedForm: null,
      openedAccount: null,

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
    this.issuingAccounts.forEach(acc => {
      this.getAccountDetails(acc.public_key);
    });
    if (this.data.type === 'issuing') {
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
          per_page_count: 10,
        }
      });
    } else { // worker account
      await this.$http({
        url: ApiUrls.Accounts.SearchWorkerAccountTrustlines + `/${this.data.public_key}`,
        method: 'GET',
      });
    }

    this.getAccountList();
  },
  methods: {
    ...mapActions(['getAccountList', 'getAccountDetails']),
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
    },
    onOpenForm (type, acc) {
      this.openedForm = type;
      this.openedAccount = acc;
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
