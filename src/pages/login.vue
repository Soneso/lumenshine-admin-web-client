<template>
  <v-app id="inspire">
    <v-content>
      <v-container fluid fill-height>
        <v-layout align-center justify-center>
          <v-flex xs12 sm8 md4>
            <v-card class="elevation-12">
              <v-toolbar dark color="primary">
                <v-toolbar-title>Login form</v-toolbar-title>
                <v-spacer/>
              </v-toolbar>
              <v-card-text>
                <v-form>
                  <v-subheader v-if="errorMessage" class="error">{{ errorMessage.message }}</v-subheader>
                  <v-text-field v-model="email" prepend-icon="person" name="login" label="E-Mail" type="text"/>
                  <v-text-field
                    id="password"
                    v-model="password"
                    prepend-icon="lock"
                    name="password"
                    label="Password"
                    type="password"/>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer/>
                <v-btn color="primary" @click.prevent="login">Login</v-btn>
              </v-card-actions>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
// import { Urls } from '@/router/urls';

export default {
  name: 'Login',
  props: {
    source: {
      type: String,
      default: '',
    }
  },
  data: () => ({
    drawer: null,
    email: '',
    password: '',
    errorMessage: null,
  }),
  methods: {
    login () {
      this.errorMessage = null;
      this.$auth.login({
        data: { username: this.email, password: this.password },
        rememberMe: true,
        redirect: '/dashboard',
        error (err) {
          this.errorMessage = err.response.data;
        },
      });
    }
  }
};
</script>
