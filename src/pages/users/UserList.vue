<template>
  <v-flex xs12 sm12>
    <v-card>
      <v-card-title>
        Users
        <v-spacer/>
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
            v-model="emailFilter"
            append-icon="search"
            label="Email"
            hide-details
          />
        </v-layout>
      </v-container>
      <v-container>
        <v-layout row justify-space-between>
          <v-checkbox
            v-model="serviceFilter"
            label="Service"
          />
          <v-checkbox
            v-model="adminFilter"
            label="Administrator"
          />
          <v-checkbox
            v-model="devFilter"
            label="Developer"
          />
          <v-checkbox
            v-model="activeFilter"
            label="Active"
          />
        </v-layout>
      </v-container>
      <v-data-table
        :headers="headers"
        :items="filteredItems"
        :loading="userListStatus.loading"
        hide-actions
        class="elevation-1"
      >
        <template slot="items" slot-scope="props">
          <tr @click="editUser(props.item.id)">
            <td >{{ props.item.name }}</td>
            <td class="text-xs-right">{{ props.item.email }}</td>
            <td class="text-xs-right">{{ props.item.phone }}</td>
            <td class="text-xs-right" v-html="props.item.roles"/>
            <td class="text-xs-right">
              <v-checkbox
                :input-value="props.item.active"
                disabled
              />
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </v-flex>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'Userlist',
  data () {
    return {
      headers: [
        { text: 'Name', align: 'left', value: 'name' },
        { text: 'Email', value: 'email', sortable: false },
        { text: 'Phone', value: 'phone', sortable: false },
        { text: 'Roles', value: 'roles' },
        { text: 'Active', value: 'active' },
      ],
      nameFilter: '',
      emailFilter: '',

      activeFilter: false,
      serviceFilter: false,
      adminFilter: false,
      devFilter: false,
    };
  },
  computed: {
    ...mapGetters(['userListStatus', 'userList']),
    extendedItems () {
      return this.userList.map(user => Object.assign({}, user, {
        name: `${user.firstname} ${user.lastname}`,
        roles: user.groups.join('<br>'),
      }));
    },
    filteredItems () {
      return this.extendedItems.filter(item => {
        if (this.activeFilter && !item.active) return false;
        if (this.serviceFilter && !item.groups.includes('Service')) return false;
        if (this.adminFilter && !item.groups.includes('Administrators')) return false;
        if (this.devFilter && !item.groups.includes('Developers')) return false;
        if (this.nameFilter !== '' && `${item.firstname} ${item.lastname}`.indexOf(this.nameFilter) === -1) return false;
        if (this.emailFilter !== '' && item.email.indexOf(this.emailFilter) === -1) return false;
        return true;
      });
    }
  },
  created () {
    this.getUserList();
  },
  methods: {
    ...mapActions(['getUserList']),
    editUser (id) {
      this.$router.push({ path: `users/${id}` });
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
