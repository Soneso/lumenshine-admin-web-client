T<template>
  <form>
    <a @click="showDialog = true">Reset 2FA Secret</a>
    <br>

    <v-dialog v-model="showDialog" max-width="50%" @keydown.esc="showDialog = false">
      <v-toolbar color="red" dark dense>
        <v-toolbar-title class="white--text">Reset 2FA Secret</v-toolbar-title>
      </v-toolbar>
      <v-card tile>
        <v-card-text>
          <v-progress-linear v-if="loading" :indeterminate="true"/>
          <table>
            <tr>
              <td><strong>Customer ID: </strong></td>
              <td>{{ data.id }}</td>
            </tr>
            <tr>
              <td><strong>Email: </strong></td>
              <td>{{ data.email }}</td>
            </tr>
          </table>
          <br>
          <p>After resetting the 2FA Secret, the user will receive an email with<br>instructions on how to obtain and use his new 2FA Secret.</p>
          <v-checkbox
            v-model="confirmRisks"
            :error-messages="confirmRisksErrors"
            label="I confirm that I have validated the identity of the user"
          />
        </v-card-text>
        <v-card-actions>
          <div v-if="errors.length > 0">
            <v-subheader v-for="error in errors" :key="error.error_code" class="error">{{ error.error_message }}</v-subheader>
          </div>
          <v-spacer/>
          <v-btn color="red darken-1" flat="flat" @click.native="reset2fa">Submit</v-btn>
          <v-btn flat="flat" @click.native="cancel">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </form>
</template>

<script>
import { validationMixin } from 'vuelidate';
import { required, sameAs } from 'vuelidate/lib/validators';

export default {
  name: 'CustomerResetTfaForm',
  mixins: [validationMixin],
  props: {
    data: {
      type: Object,
      default: () => ({})
    },
    errors: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      required: true,
    }
  },
  validations () {
    const base = {
      confirmRisks: { required, confirmed: sameAs(() => true) }
    };

    return base;
  },
  data () {
    return {
      confirmRisks: false,

      showDialog: false,

      resetPending: false,
    };
  },
  computed: {
    confirmRisksErrors () {
      const errors = [];
      if (!this.$v.confirmRisks.$dirty) return errors;
      !this.$v.confirmRisks.required && errors.push('Confirmation is required.');
      !this.$v.confirmRisks.confirmed && errors.push('Confirmation is required.');
      return errors;
    },
  },
  watch: {
    loading (val) {
      if (!val && this.resetPending) {
        this.resetPending = false;
        if (this.errors.length === 0) {
          this.reset();
        }
      }
    }
  },
  methods: {
    reset () {
      this.confirmRisks = false;
      this.showDialog = false;
      this.$v.$reset();
      this.$emit('cancel');
    },

    reset2fa () {
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }
      this.$emit('reset');
      this.resetPending = true;
    },

    cancel () {
      this.reset();
    },
  }
};
</script>

<style lang="scss" scoped>
</style>
