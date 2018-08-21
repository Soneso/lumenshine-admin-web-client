<template>
  <v-app id="inspire">
    <confirm-dialog ref="confirm"/>
    <div v-if="$auth.ready()">
      <app-menu :drawer="drawer"/>
      <v-toolbar :clipped-left="$vuetify.breakpoint.lgAndUp" color="blue darken-3" dark app fixed>
        <v-toolbar-title style="width: 400px" class="ml-0 pl-3">
          <v-toolbar-side-icon @click.stop="drawer = !drawer"/>
          <span class="hidden-sm-and-down">ICO & Wallet Admin Portal</span>
        </v-toolbar-title>
        <v-spacer/>
        <span class="hidden-sm-and-down">{{ userData.email }}</span>
        <v-btn icon @click="logout">
          <v-icon>exit_to_app</v-icon>
        </v-btn>
      </v-toolbar>
      <v-content>
        <v-container fluid fill-height>
          <v-layout>
            <router-view/>
          </v-layout>
        </v-container>
      </v-content>
    </div>

    <div v-if="!$auth.ready()">
      Loading ...
    </div>
  </v-app>
</template>

<script>
import { mapActions } from 'vuex';

import ConfirmDialog from '@/components/ConfirmDialog';
import AppMenu from '@/components/AppMenu';

export default {
  name: 'Home',
  components: { AppMenu, ConfirmDialog },
  props: {
    source: {
      type: String,
      default: '',
    }
  },
  data () {
    return {
      drawer: true,
    };
  },
  computed: {
    userData () {
      return this.$auth.user();
    }
  },
  mounted () {
    this.$root.$confirm = this.$refs.confirm.open;
  },
  methods: {
    ...mapActions(['resetState']),
    logout () {
      this.$auth.logout({
        makeRequest: false,
      });
      this.resetState();
    }
  },
};
</script>

<style lang="scss" scoped>
</style>
