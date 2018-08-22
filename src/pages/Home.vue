<template>
  <v-flex xs12 sm12>
    <v-container justify-space-between>
      <v-subheader class="headline">
        Welcome, {{ userData.firstname }} {{ userData.lastname }}
      </v-subheader>
      <table>
        <tr>
          <td>System status:</td>
          <td class="success-text">up and running</td>
        </tr>
        <tr>
          <td>System version:</td>
          <td>{{ buildData }}</td>
        </tr>
        <tr>
          <td/>
          <td/>
        </tr>
        <tr>
          <td>Support Hotline:</td>
          <td>+49 89 763 663</td>
        </tr>
        <tr>
          <td>Support Email:</td>
          <td><a href="mailto:support@ico-portal.net">support@ico-portal.net</a></td>
        </tr>
      </table>
      <br><br>
      <v-layout row class="footer-buttons">
        <a href="#">FAQ</a>
        <a href="#">Help</a>
        <a href="#">Feedback</a>
      </v-layout>
    </v-container>
  </v-flex>
</template>

<script>
import config from '../config';
export default {
  name: 'Home',
  computed: {
    userData () {
      return this.$auth.user();
    },
    buildData () {
      /* global __BUILD_DATE__ */
      return `v${config.APP_VERSION} build ${__BUILD_DATE__}`;
    }
  }
};
</script>

<style lang="scss" scoped>
table {
  margin: 20px;
  margin-left: -14px;
  td {
    padding: 2px 14px;
  }
}
.footer-buttons {
  a {
    margin-right: 30px;
  }
}
</style>
