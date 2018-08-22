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
        <v-list-group v-else-if="item.children" v-model="item.active" :key="item.text" :prepend-icon="item.model ? item.icon : item['icon-alt']" append-icon="">
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
            { text: 'All accounts', link: '/accounts' },
            { text: 'Add account', link: '/accounts/add' },
          ]
        },
        {
          icon: 'keyboard_arrow_up',
          'icon-alt': 'keyboard_arrow_down',
          text: 'Wallet management',
          active: this.$route.path.startsWith('/known_currencies'),
          roles: ['Administrators', 'Developers'],
          children: [
            { text: 'Promos', link: '/promos' },
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

<style lang="scss" scoped>
</style>
