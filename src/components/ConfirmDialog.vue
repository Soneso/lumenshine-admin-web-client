<template>
  <v-dialog v-model="dialog" :max-width="options.width" @keydown.esc="cancel()">
    <v-toolbar :color="options.color" dark dense>
      <v-toolbar-title class="white--text">{{ title }}</v-toolbar-title>
    </v-toolbar>
    <v-card tile>
      <v-card-text v-show="!!message">{{ message }}</v-card-text>
      <v-card-actions>
        <v-spacer/>
        <v-btn color="primary darken-1" flat="flat" @click.native="agree()">Yes</v-btn>
        <v-btn color="grey" flat="flat" @click.native="cancel()">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data () {
    return {
      dialog: false,
      resolve: null,
      reject: null,
      message: null,
      title: null,
      options: {
        color: 'primary',
        width: 290,
      }
    };
  },
  methods: {
    open (title, message, options) {
      this.dialog = true;
      this.title = title;
      this.message = message;
      this.options = Object.assign(this.options, options);
      return new Promise((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
      });
    },
    agree () {
      this.resolve(true);
      this.dialog = false;
    },
    cancel () {
      this.resolve(false);
      this.dialog = false;
    },
  },
};
</script>
