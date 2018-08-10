<template>
  <v-app id="inspire">
    <confirm-dialog ref="confirm"/>
    <div v-if="$auth.ready()">
      <app-menu :drawer="drawer"/>
      <v-toolbar :clipped-left="$vuetify.breakpoint.lgAndUp" color="blue darken-3" dark app fixed>
        <v-toolbar-title style="width: 300px" class="ml-0 pl-3">
          <v-toolbar-side-icon @click.stop="drawer = !drawer"/>
          <span class="hidden-sm-and-down">CaliCoin-Admin</span>
        </v-toolbar-title>
        <v-text-field flat solo-inverted prepend-icon="search" label="Search" class="hidden-sm-and-down"/>
        <v-spacer/>
        <v-btn icon>
          <v-icon>apps</v-icon>
        </v-btn>
        <v-btn icon>
          <v-icon>notifications</v-icon>
        </v-btn>
        <v-btn icon @click="logout">
          <v-icon>exit_to_app</v-icon>
        </v-btn>
      </v-toolbar>
      <v-content>
        <v-container fluid fill-height>
          <v-layout justify-center align-center>
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
