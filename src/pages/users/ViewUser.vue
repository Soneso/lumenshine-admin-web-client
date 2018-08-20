<template>
  <v-flex xs12 sm12>
    <v-card>
      <v-progress-linear v-if="loading" :indeterminate="true"/>
      <v-card-title>
        User details
        <v-spacer/>
      </v-card-title>
      <v-container v-if="userData" row justify-space-between>
        <user-form :data="userData" readonly/>
      </v-container>
    </v-card>
  </v-flex>
</template>

<script>
import { Urls } from '@/router/urls';

import UserForm from '@/forms/UserForm';

export default {
  name: 'ViewUser',
  components: { UserForm },
  data () {
    return {
      loading: false,

      userData: null,
    };
  },
  async created () {
    this.loading = true;
    try {
      const res = await this.$http({
        url: `${Urls.Users.GetUser}/${this.$route.params.id}`,
        method: 'GET'
      });
      this.userData = res.data;
    } catch (err) {
      this.loading = false;
    }
    this.loading = false;
  },
};
</script>

<style lang="scss" scoped>
</style>
