<template>
  <form>
    <v-dialog v-model="showDialog" max-width="50%" @keydown.esc="showDialog = false">
      <v-toolbar color="primary" dark dense>
        <v-toolbar-title class="white--text">Change signer weight</v-toolbar-title>
      </v-toolbar>
      <v-card tile>
        <v-card-text>
          <v-progress-linear v-if="loading" :indeterminate="true"/>
          <table>
            <tr>
              <td><strong>Signer public key</strong></td>
              <td>{{ signer.public_key }}</td>
            </tr>
            <tr/>
            <tr>
              <td><strong>Signer name</strong></td>
              <td>
                <v-text-field
                  v-model="name"
                  :error-messages="nameErrors"
                  required
                  single-line
                  @input="$v.name.$touch()"
                  @blur="$v.name.$touch()"
                />
              </td>
            </tr>
            <tr>
              <td><strong>Signer description</strong></td>
              <td>
                <v-text-field
                  v-model="description"
                  required
                  single-line
                />
              </td>
            </tr>
          </table>
        </v-card-text>
        <v-card-actions>
          <div v-if="errors.length > 0">
            <v-subheader v-for="error in errors" :key="error.error_code" class="error">{{ error.error_message }}</v-subheader>
          </div>
          <v-spacer/>
          <v-btn color="primary darken-1" flat="flat" @click.native="updateSigner">Submit</v-btn>
          <v-btn color="primary darken-1" flat="flat" @click.native="reset">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </form>
</template>

<script>
import { validationMixin } from 'vuelidate';
import { required } from 'vuelidate/lib/validators';

export default {
  name: 'AccountSignerEditorForm',
  mixins: [validationMixin],
  props: {
    data: {
      type: Object,
      default: () => ({})
    },
    signer: {
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
    },
  },
  validations () {
    const base = {
      name: { required },
    };
    return base;
  },
  data () {
    return {
      name: this.signer.name,
      description: this.signer.description,

      showDialog: true,

      changePending: false,
    };
  },
  computed: {
    nameErrors () {
      const errors = [];
      if (!this.$v.name.$dirty) return errors;
      !this.$v.name.required && errors.push('Name is required.');
      return errors;
    },
  },
  watch: {
    loading (val) {
      if (!val && this.updateSignerPending) {
        this.updateSignerPending = false;
        if (this.errors.length === 0) {
          this.reset();
        }
      }
    }
  },
  methods: {
    reset () {
      this.name = this.signer.name;
      this.description = this.signer.description;
      this.showDialog = false;
      this.$v.$reset();
    },

    updateSigner () {
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }
      this.$emit('updateSigner', {
        name: this.name,
        description: this.description,
        signerPublicKey: this.signer.public_key,
        type: this.signer.type,
      });
      this.updateSignerPending = true;
    },

    onCancel () {
      this.reset();
    },
  }
};
</script>

<style lang="scss" scoped>
table {
  width: 100%;
}
</style>
