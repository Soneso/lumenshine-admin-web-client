<template>
  <v-navigation-drawer :clipped="$vuetify.breakpoint.lgAndUp" v-model="drawer" fixed app>
    <v-list dense>
      <template v-for="item in items">
        <v-layout v-if="item.heading" :key="item.heading" row align-center>
          <v-flex xs6>
            <v-subheader v-if="item.heading">
              {{ item.heading }}
            </v-subheader>
          </v-flex>
          <v-flex xs6 class="text-xs-center">
            <a href="#!" class="body-2 black--text">EDIT</a>
          </v-flex>
        </v-layout>

        <v-list-group
          v-else-if="item.children"
          v-model="item.active"
          :key="item.text"
          :prepend-icon="item.model ? item.icon : item['icon-alt']"
          append-icon=""
          class="v-list--outside">
          <v-list-tile slot="activator" :to="item.link">
            <v-list-tile-content>
              <v-list-tile-title>
                {{ item.text }}
              </v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile v-for="(child, i) in item.children" :key="i" :to="child.link">
            <v-list-tile-action v-if="child.icon">
              <v-icon>{{ child.icon }}</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>
                {{ child.text }}
              </v-list-tile-title>

              <v-list v-if="child.children && child.children.length > 0" class="v-list--inside">
                <v-list-group v-if="child.children" :value="true" :key="item.text">

                  <v-list-tile slot="activator" to="#">
                    <v-list-tile-content>
                      <v-list-tile-title>
                        {{ currentAccount ? currentAccount.name : '' }}
                      </v-list-tile-title>
                    </v-list-tile-content>
                  </v-list-tile>

                  <v-list-tile-content class="pl-4">
                    <v-list-tile v-for="(grandchild, i) in child.children" :key="i" :to="grandchild.link" class="v-list__tile--subtile" >
                      <v-list-tile-title>
                        {{ grandchild.text }}
                      </v-list-tile-title>
                    </v-list-tile>
                  </v-list-tile-content>

                </v-list-group>
              </v-list>

            </v-list-tile-content>
          </v-list-tile>
        </v-list-group>

        <v-list-tile v-else :to="item.link" :key="item.text">
          <v-list-tile-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>
              {{ item.text }}
            </v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

      </template>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'Menu',
  props: {
    drawer: {
      type: Boolean,
      required: true,
    }
  },
  data () {
    return {
      items: [],
    };
  },
  computed: {
    ...mapGetters(['accountList']),
    currentAccount () {
      if (!this.$route.params.pk || !this.accountList) return null;
      return this.accountList.find(acc => acc.public_key === this.$route.params.pk);
    }
  },
  watch: {
    $route () {
      this.recalculateMenuItems();
    }
  },
  created () {
    this.recalculateMenuItems();
  },
  methods: {
    recalculateMenuItems () {
      const isAccountFunded = !this.currentAccount || this.currentAccount.signers !== undefined;
      const accountEditSubmenuItems = !this.currentAccount ? [] : [
        { text: 'Details', link: `/accounts/${this.currentAccount.public_key}/details` },
        ...(isAccountFunded && this.currentAccount.type !== 'funding' ? [{ text: 'Trust', link: `/accounts/${this.currentAccount.public_key}/trust` }] : []),
        ...(isAccountFunded && this.currentAccount.type !== 'funding' ? [{ text: 'Multi-Sig', link: `/accounts/${this.currentAccount.public_key}/multisig` }] : []),
        ...(isAccountFunded ? [{ text: 'Transactions', link: `/accounts/${this.currentAccount.public_key}/transactions` }] : []),
        // ...(isAccountFunded && this.currentAccount.type !== 'funding' ? [{ text: 'Stellar form (old one)', link: `/accounts/${this.currentAccount.public_key}/stellar` }] : []), // temporary
      ];

      const menu = [
        { icon: 'contacts', text: 'Home', link: '/' },
        {
          icon: 'keyboard_arrow_up',
          'icon-alt': 'keyboard_arrow_down',
          text: 'ICO Management',
          active: this.$route.path.startsWith('/ico'),
          roles: ['Administrators', 'Developers'],
        },
        {
          icon: 'keyboard_arrow_up',
          'icon-alt': 'keyboard_arrow_down',
          text: 'Customer Management',
          active: this.$route.path.startsWith('/customer'),
          roles: ['Administrators', 'Developers'],
        },
        {
          icon: 'keyboard_arrow_up',
          'icon-alt': 'keyboard_arrow_down',
          text: 'Stellar Accounts',
          active: this.$route.path.startsWith('/accounts'),
          roles: ['Administrators', 'Developers'],
          children: [
            {
              text: 'All accounts',
              link: '/accounts',
              children: accountEditSubmenuItems,
              active: false
            },
            { text: 'Add account', link: '/accounts/add', active: false },
          ]
        },
        {
          icon: 'keyboard_arrow_up',
          'icon-alt': 'keyboard_arrow_down',
          text: 'Wallet management',
          active: this.$route.path.startsWith('/known_currencies'),
          roles: ['Administrators', 'Developers'],
          children: [
            // { text: 'Promos', link: '/promos' },
            { text: 'Known currencies', link: '/known_currencies' },
            { text: 'Known inflation destinations', link: '/known_inflation_destinations' },
          ]
        },
        {
          icon: 'keyboard_arrow_up',
          'icon-alt': 'keyboard_arrow_down',
          text: 'Team',
          active: this.$route.path.startsWith('/users'),
          roles: ['Administrators', 'Developers'],
          children: [
            { text: 'Members', link: '/users' },
            { text: 'Add member', link: '/users/add' },
            { text: 'Edit member', link: `/users/edit/${this.$route.params.id}`, visible: ['ViewUser', 'EditUser'].includes(this.$route.name) }
          ]
        },
        { icon: 'contacts', text: 'My account', link: '/myuser' },
      ];
      const currentRoles = this.$auth.user().groups;
      const res = menu
        .filter(item =>
          item.visible !== false &&
          (item.roles === undefined || item.roles.some(allowedRole => currentRoles.includes(allowedRole))))
        .map(item => ({
          ...item,
          children:
            (item.children || [])
              .filter(item =>
                item.visible !== false &&
                (item.roles === undefined || item.roles.some(allowedRole => currentRoles.includes(allowedRole)))
              )
        }));
      this.items = res;
    }
  },
};
</script>

<style lang="scss">
</style>
