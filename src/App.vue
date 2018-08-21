<template>
  <v-app id="app">
    <router-view/>
  </v-app>
</template>

<script>
export default {
  name: 'App'
};
</script>

<style lang="scss">
.theme--light .application--wrap {
  background: #fff;
  .v-subheader.headline {
    padding: 0;
    padding-bottom: 25px;
    color: #597EAA;
  }
  .blue.darken-3 {
    background-color: #597EAA !important;
    border-color: #597EAA !important;
  }
}

</style>
