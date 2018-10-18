<template>
  <div>
    <strong>Wallets</strong>
    <table v-if="customer" class="table">
      <thead>
        <th style="width: 25%;">Name</th>
        <th style="width: 25%;">Public key</th>
        <th style="width: 25%;">Balances</th>
        <th style="width: 25%;"/>
      </thead>
      <tr v-for="wallet in customer.wallets" :key="wallet.public_key">
        <td>{{ wallet.name }}</td>
        <td>
          {{ wallet.public_key }}
          <a
            v-clipboard:copy="wallet.public_key"
            v-clipboard:success="() => {copiedAccount = wallet.public_key, transactionCopiedAccount = null}"
            class="wallet-link">
            <v-icon>file_copy</v-icon>
          </a>
          <span v-if="wallet.public_key === copiedAccount">Copied</span>
        </td>
        <td>
          <template v-if="wallet.balances">
            <span v-for="balance in wallet.balances" :key="`${balance.asset_code} ${balance.asset_issuer}`">{{ balance.asset_type === 'native' ? `${balance.balance} XLM` : `${balance.balance} ${balance.asset_code}` }}<br></span>
          </template>
        </td>
        <td>
          <a v-if="wallet.balances" href="#" @click.prevent="loadTransactions(wallet)">Transactions</a><br>
        </td>
      </tr>
    </table>

    <v-flex v-if="openedWallet" xs12 sm12>
      <br><br>
      <v-container>
        <v-subheader class="headline">
          <br>
          Transaction history
        </v-subheader>
        <v-progress-linear v-if="loading" :indeterminate="true"/>
        <p>
          Primary wallet:
          {{ openedWallet }}
          <a
            v-clipboard:copy="openedWallet"
            v-clipboard:success="() => {transactionCopiedAccount = openedWallet, copiedAccount = null}"
            class="wallet-link">
            <v-icon>file_copy</v-icon>
          </a>
          <span v-if="openedWallet === transactionCopiedAccount">Copied</span>
        </p>
        <div v-if="errors.length > 0">
          <v-subheader v-for="error in errors" :key="error.error_code" class="error">{{ error.error_message }}</v-subheader>
        </div>
        <div v-if="operations" row justify-space-between>
          <table>
            <thead>
              <th>Date</th>
              <th>Amount</th>
              <th>Memo</th>
              <th>Operation</th>
            </thead>
            <tbody>
              <tr v-for="operation in operations" :key="operation.id">
                <td>{{ dayjs(operation.created_at).format('DD MMM YYYY HH:mm:ss') }}</td>
                <td>
                  <span v-if="operation.to && operation.amount" :class="{ 'success-text': operation.to === $route.params.pk, 'warning-text': operation.to !== $route.params.pk }">
                    {{ operation.to !== $route.params.pk ? ' - ' : '' }}{{ operation.amount }} {{ operation.asset_type === 'native' ? 'XLM' : operation.asset_code }}
                  </span>
                </td>
                <td>{{ operation.transaction.memo }}</td>
                <td>
                  <span>Type: {{ operation.type }}</span><br>
                  <span>Operation - ID: <a href="#" @click.prevent="onDetailsClick(operation)">{{ operation.id }}</a></span><br>
                </td>
              </tr>
            </tbody>
          </table>
          <v-layout justify-center>
            <v-btn v-if="!loading" href="#" @click.prevent="onLoadMore">Load more</v-btn>
          </v-layout>
        </div>
        <v-dialog v-model="detailsModalShown" @keydown.esc="cancel()">
          <v-toolbar color="primary" dark dense>
            <v-toolbar-title class="white--text">Operation details</v-toolbar-title>
          </v-toolbar>
          <v-card tile>
            <v-card-text><pre>{{ detailsModalData }}</pre></v-card-text>
            <v-card-actions>
              <v-spacer/>
              <v-btn color="primary darken-1" flat="flat" @click.native="detailsModalShown = false">Close</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-container>
    </v-flex>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import dayjs from 'dayjs';
import StellarSdk from 'stellar-sdk';

import config from '@/config';

const StellarAPI = new StellarSdk.Server(config.HORIZON_URL);
if (config.IS_TEST_NETWORK) {
  StellarSdk.Network.useTestNetwork();
} else {
  StellarSdk.Network.usePublicNetwork();
}

export default {
  components: { },
  data () {
    return {
      copiedAccount: null,
      transactionCopiedAccount: null,
      openedWallet: null,

      operations: [],
      errors: [],
      loading: false,
      detailsModalShown: false,
      detailsModalData: null,
    };
  },
  computed: {
    customer () {
      return this.$store.getters.customer(this.$route.params.id);
    }
  },
  async created () {
    await this.getCustomerDetails(this.$route.params.id);
  },
  methods: {
    ...mapActions(['getCustomerDetails']),
    onDetailsClick (operation) {
      this.detailsModalData = JSON.stringify({...operation, transaction: undefined, _links: undefined}, null, 2);
      this.detailsModalShown = true;
    },
    async processOperationQuery () {
      const operations = this.operationQuery.records;
      const transactionQueries = await Promise.all(operations.map(t => t.transaction()));
      const transactions = transactionQueries.map(q => q).reduce((acc, c) => acc.concat(c), []);

      operations.forEach(o => {
        const transaction = transactions.filter(t => t.hash === o.transaction_hash);
        o.transaction = transaction.length > 0 ? transaction[0] : null;
      });

      this.operations = [...this.operations, ...operations];
    },
    async onLoadMore () {
      this.loading = true;
      this.operationQuery = await this.operationQuery.next();
      await this.processOperationQuery();
      this.loading = false;
    },
    async loadTransactions (wallet) {
      this.operations = [];
      this.openedWallet = wallet.id;
      this.operationQuery = await StellarAPI.operations()
        .forAccount(wallet.id)
        .order('desc')
        .limit(20)
        .call();
      await this.processOperationQuery();
    },
    dayjs
  }
};
</script>

<style lang="scss" scoped>
table {
  width: 100%;
  table-layout: fixed;
  vertical-align: center;
  thead th {
    border-bottom: 1px solid #aaa;
  }
  td {
    text-align: center;
    word-break: break-all;
    vertical-align: center;
    border-bottom: 1px dotted #aaa;
  }
}
</style>
