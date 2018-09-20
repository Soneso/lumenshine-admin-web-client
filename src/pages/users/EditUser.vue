<template>
  <v-flex xs12 sm12>
    <v-container v-if="userData" row justify-space-between>
      <v-progress-linear v-if="loading" :indeterminate="true"/>
      <v-subheader class="headline">
        Edit user
      </v-subheader>
      <div v-if="errorMessages.length > 0">
        <v-subheader v-for="error in errorMessages" :key="error.error_code" class="error">{{ error.error_message }}</v-subheader>
      </div>
      <user-form :data="userData" @submit="submitForm"/>
    </v-container>
  </v-flex>
</template>

<script>
import { mapActions } from 'vuex';

import ApiUrls from '@/services/apiUrls';

import UserForm from '@/forms/UserForm';

export default {
  name: 'EditUser',
  components: { UserForm },
  data () {
    return {
      loading: false,

      userData: null,
      errorMessages: [],
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
  methods: {
    ...mapActions(['getUserList']),
    async submitForm (data) {
      this.loading = true;
      this.errorMessages = [];
      try {
        await this.$http({
          url: ApiUrls.Users.EditUser,
          method: 'POST',
          data: {
            id: parseInt(this.$route.params.id, 10),
            firstname: data.firstName,
            lastname: data.lastName,
            phone: data.phone,
            email: data.email,
            active: data.active,
            ...(data.password ? { password: data.password } : {})
          }
        });
        this.userData.groups.sort();
        if (data.groups.length !== this.userData.groups.length || !data.groups.sort().every((v, i) => v === this.userData.groups[i])) {
          await this.$http({
            url: ApiUrls.Users.SetGroups,
            method: 'POST',
            data: {
              id: parseInt(this.$route.params.id, 10),
              groups: data.groups,
            }
          });
        }
        await this.getUserList();
        this.$router.push({ path: '/users' });
      } catch (err) {
        this.errorMessages = err.response.data;
        this.loading = false;
      }
      this.loading = false;
    },
  }
};
</script>

<style lang="scss" scoped>
</style>
