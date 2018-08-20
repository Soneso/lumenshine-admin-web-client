<template>
  <v-flex xs12 sm12>
    <v-card>
      <v-card-title>
        Known Inflation Destinations
        <v-spacer/>
        <v-btn @click="addKnownInflationDestination">Add Inflation Destination</v-btn>
        <v-btn @click="onRefresh">Refresh</v-btn>
      </v-card-title>
      <div v-if="errorMessages.length > 0">
        <v-subheader v-for="error in errorMessages" :key="error.error_code" class="error">{{ error.error_message }}</v-subheader>
      </div>
      <v-data-table
        :headers="headers"
        :items="items"
        :loading="knownInflationDestinationsListStatus.loading"
        :pagination.sync="pagination"
        hide-actions
        class="elevation-1"
      >
        <template slot="items" slot-scope="props">
          <tr>
            <td @click="editKnownInflationDestination(props.item.id)">{{ props.item.name }} <br> {{ props.item.issuer_public_key }}</td>
            <td>{{ props.item.short_description }}</td>
            <!-- <td>{{ props.item.long_description }}</td> -->
            <td>
              <v-btn :disabled="props.item.order_index <= 1" flat icon @click="changeOrder(props.item.id, -1)">
                <v-icon>keyboard_arrow_up</v-icon>
              </v-btn>
              {{ props.item.order_index }}
              <v-btn :disabled="props.item.order_index >= items.length" flat icon @click="changeOrder(props.item.id, 1)">
                <v-icon>keyboard_arrow_down</v-icon>
              </v-btn>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </v-flex>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import { Urls } from '@/router/urls';

export default {
  name: 'KnownInflationDestinationsList',
  data () {
    return {
      headers: [
        { text: 'Name / Public key', value: 'nameAndPublicKey' },
        { text: 'Short Description', value: 'short_description' },
        // { text: 'Long Description', value: 'long_description' },
        { text: 'Order Index', value: 'order_index' },
      ],
      pagination: {'sortBy': 'order_index', 'ascending': true, 'rowsPerPage': -1},
      errorMessages: [],
    };
  },
  computed: {
    ...mapGetters(['knownInflationDestinationsListStatus', 'knownInflationDestinationsList']),
    items () {
      if (!this.knownInflationDestinationsList) return [];
      return this.knownInflationDestinationsList;
    },
  },
  created () {
    this.getKnownInflationDestinationsList();
  },
  methods: {
    ...mapActions(['getKnownInflationDestinationsList']),
    addKnownInflationDestination (id) {
      this.$router.push({ path: `known_inflation_destinations/add` });
    },
    editKnownInflationDestination (id) {
      this.$router.push({ path: `known_inflation_destinations/${id}` });
    },
    async changeOrder (id, orderModifier) {
      this.loading = true;
      this.errorMessages = [];
      try {
        await this.$http({
          url: Urls.KnownInflationDestinations.ChangeInflationDestinationOrder,
          method: 'POST',
          data: {
            id: parseInt(id, 10),
            order_modifier: parseInt(orderModifier, 10),
          }
        });
        await this.getKnownInflationDestinationsList();
      } catch (err) {
        this.errorMessages = err.response.data;
        this.loading = false;
      }
      this.loading = false;
    },
    onRefresh () {
      this.getKnownInflationDestinationsList();
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
