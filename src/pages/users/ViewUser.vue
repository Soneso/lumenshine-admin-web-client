<template>
  <v-flex xs12 sm12>
    <v-container v-if="userData" row justify-space-between>
      <v-progress-linear v-if="loading" :indeterminate="true"/>
      <v-subheader class="headline">
        User details
      </v-subheader>
      <user-form :data="userData" readonly/>
    </v-container>
  </v-flex>
</template>

<script>
import ApiUrls from '@/services/apiUrls';

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
        url: `${ApiUrls.Users.GetUser}/${this.$route.params.id}`,
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
