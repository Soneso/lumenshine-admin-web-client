<template>
  <v-flex xs12 sm12>
    <v-container>
      <v-subheader class="headline">
        Transaction history
        <v-spacer/>
      </v-subheader>
    </v-container>
    <v-container>
      <v-progress-linear v-if="loading" :indeterminate="true"/>
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
                <span v-if="operation.to && operation.amount" :class="{ 'success-text': operation.to === $route.params.pk, 'warning-text': operation.to !== $route.params.pk}">
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
</template>

<script>
import StellarSdk from 'stellar-sdk';
import dayjs from 'dayjs';
import config from '@/config';

import { mapGetters } from 'vuex';

const StellarAPI = new StellarSdk.Server(config.HORIZON_URL);
if (config.IS_TEST_NETWORK) {
  StellarSdk.Network.useTestNetwork();
} else {
  StellarSdk.Network.usePublicNetwork();
}

export default {
  name: 'AccountTransactionList',
  components: { },
  data () {
    return {
      operations: [],
      errors: [],
      loading: false,
      detailsModalShown: false,
      detailsModalData: null,
    };
  },
  computed: {
    ...mapGetters([]),
  },
  async created () {
    this.loading = true;
    this.operationQuery = await StellarAPI.operations()
      .forAccount(this.$route.params.pk)
      .order('desc')
      .limit(20)
      .call();
    await this.processOperationQuery();
    this.loading = false;
  },
  methods: {
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
    onDetailsClick (operation) {
      this.detailsModalData = JSON.stringify({...operation, transaction: undefined, _links: undefined}, null, 2);
      this.detailsModalShown = true;
    },
    dayjs
  }
};
</script>

<style lang="scss" scoped>
table {
  width: 100%;
  td, th {
    text-align: left;
  }
  th {
    border-bottom: 1px solid #aaa;
  }
  td {
    padding: 16px 0;
    border-bottom: 1px dashed #ccc;
  }
}
</style>
