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

.application .theme--light.v-label, .theme--light .v-label {
  color: #333 !important;
}

.v-list__group {
  border-bottom: 1px solid #bbb;
}

.success-text {
  color: #4caf50 !important;
}

.warning-text {
  color: #CF2B29 !important;
}

.okay {
  background-color: #FF9900 !important;
  border-color: #FF9900 !important;
}

a {
  text-decoration: none;
}

.v-list--outside {
  .v-list__tile {
    height: auto !important;
    min-height: 40px;
  }
  .v-list--inside {
    width: 100%;
  }
}

</style>
