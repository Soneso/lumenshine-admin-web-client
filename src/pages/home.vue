<template>
  <v-flex xs12 sm12>
    <v-container justify-space-between>
      <div class="headline">
        Welcome, {{ userData.firstname }} {{ userData.lastname }}
      </div>
    </v-container>
  </v-flex>
</template>

<script>
export default {
  name: 'Home',
  computed: {
    userData () {
      return this.$auth.user();
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
