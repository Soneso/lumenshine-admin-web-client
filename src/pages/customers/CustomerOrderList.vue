<template>
  <div>
    <strong>ICO Orders of {{ customer.forename }} {{ customer.last_name }}</strong>
    <table v-if="customer" class="table">
      <thead>
        <th style="width: 20%;">Order-ID</th>
        <th style="width: 20%;">Ordered at</th>
        <th style="width: 20%;">Ordered amount</th>
        <th style="width: 20%;">Price</th>
        <th style="width: 20%;">Status</th>
      </thead>
      <tr v-for="order in customer.orders" :key="order.id">
        <td>{{ order.name }}</td>
        <td>{{ order.date }}</td>
        <td>{{ order.amount }}</td>
        <td>{{ order.price }} {{ order.chain }}</td>
        <td>{{ order.status }}</td>
      </tr>
    </table>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import dayjs from 'dayjs';

export default {
  components: { },
  data () {
    return {
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
