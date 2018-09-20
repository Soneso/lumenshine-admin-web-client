<template>
  <v-flex xs12 sm12>
    <v-container row justify-space-between>
      <v-progress-linear v-if="loading" :indeterminate="true"/>
      <v-subheader class="headline">
        Add user
      </v-subheader>
      <div v-if="errorMessages.length > 0">
        <v-subheader v-for="error in errorMessages" :key="error.error_code" class="error">{{ error.error_message }}</v-subheader>
      </div>
      <user-form :password-field-shown="true" @submit="submitForm"/>
    </v-container>
  </v-flex>
</template>

<script>
import ApiUrls from '@/services/apiUrls';

import { mapActions } from 'vuex';

import UserForm from '@/forms/UserForm';

export default {
  name: 'AddUser',
  components: { UserForm },
  data () {
    return {
      loading: false,

      errorMessages: [],
    };
  },
  methods: {
    ...mapActions(['getUserList']),
    async submitForm (data) {
      this.errorMessages = [];
      this.loading = true;
      try {
        await this.$http({
          url: ApiUrls.Users.RegisterUser,
          method: 'POST',
          data
        });
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
