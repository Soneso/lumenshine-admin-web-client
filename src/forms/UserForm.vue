<template>
  <form>
    <v-text-field
      v-model="firstName"
      :disabled="readonly"
      :error-messages="firstNameErrors"
      label="Forename"
      required
      @input="$v.firstName.$touch()"
      @blur="$v.firstName.$touch()"
    />
    <v-text-field
      v-model="lastName"
      :disabled="readonly"
      :error-messages="lastNameErrors"
      label="Last name"
      required
      @input="$v.lastName.$touch()"
      @blur="$v.lastName.$touch()"
    />

    <v-text-field
      v-model="email"
      :disabled="readonly"
      :error-messages="emailErrors"
      label="Email"
      required
      @input="$v.email.$touch()"
      @blur="$v.email.$touch()"
    />

    <v-text-field
      v-model="phone"
      :disabled="readonly"
      :error-messages="phoneErrors"
      label="Phone"
      required
      @input="$v.phone.$touch()"
      @blur="$v.phone.$touch()"
    />

    <v-checkbox
      v-if="groupCheckboxVisible"
      :disabled="readonly"
      v-model="devCheckbox"
      label="Developer"
    />
    <v-checkbox
      v-if="groupCheckboxVisible"
      :disabled="readonly"
      v-model="adminCheckbox"
      label="Administrator"
    />
    <v-checkbox
      v-if="groupCheckboxVisible"
      :disabled="readonly"
      v-model="serviceCheckbox"
      label="Service"
    />

    <v-checkbox
      v-if="activeCheckboxVisible"
      :disabled="readonly"
      v-model="activeCheckbox"
      label="Active"
    />

    <div v-if="showPasswordField">

      <v-text-field
        v-model="password"
        :error-messages="passwordErrors"
        type="password"
        label="Password"
        required
        @input="$v.password.$touch()"
        @blur="$v.password.$touch()"
      />

      <v-text-field
        v-model="passwordConfirm"
        :error-messages="passwordConfirmErrors"
        type="password"
        label="Repetition of password"
        required
        @input="$v.passwordConfirm.$touch()"
        @blur="$v.passwordConfirm.$touch()"
      />

      <v-btn v-if="!passwordFieldShown" @click="showPasswordChangeFields(false)">Don't change password</v-btn>

    </div>
    <v-btn v-else-if="!readonly && !passwordFieldShown" @click="showPasswordChangeFields(true)">Change password</v-btn>

    <v-btn v-if="!readonly" @click="submitForm">submit</v-btn>
  </form>
</template>

<script>
import { validationMixin } from 'vuelidate';
import { required, email, sameAs } from 'vuelidate/lib/validators';

export default {
  name: 'UserForm',
  mixins: [validationMixin],
  props: {
    data: {
      type: Object,
      default: () => ({})
    },
    passwordFieldShown: {
      type: Boolean,
      default: false,
    },
    activeCheckboxVisible: {
      type: Boolean,
      default: true,
    },
    groupCheckboxVisible: {
      type: Boolean,
      default: true,
    },
    readonly: {
      type: Boolean,
      default: false,
    }
  },

  validations () {
    return {
      firstName: { required },
      lastName: { required },
      phone: { required, validPhone: val => /^[+]?[0-9]{11,16}$/.test(val) },
      email: { required, email },
      ...(this.showPasswordField ? {
        password: { required },
        passwordConfirm: { required, match: sameAs('password') }
      } : {})
    };
  },

  data () {
    return {
      firstName: this.data.firstname || '',
      lastName: this.data.lastname || '',
      phone: this.data.phone || '',
      email: this.data.email || '',
      password: '',
      passwordConfirm: '',

      devCheckbox: (this.data.groups && this.data.groups.includes('Developers')) || false,
      adminCheckbox: (this.data.groups && this.data.groups.includes('Administrators')) || false,
      serviceCheckbox: (this.data.groups && this.data.groups.includes('Service')) || false,

      activeCheckbox: this.data.active || false,

      wantsPasswordChange: false,
    };
  },
  computed: {
    showPasswordField () {
      return !this.readonly && (this.wantsPasswordChange || this.passwordFieldShown);
    },
    firstNameErrors () {
      const errors = [];
      if (!this.$v.firstName.$dirty) return errors;
      !this.$v.firstName.required && errors.push('Forename is required.');
      return errors;
    },
    lastNameErrors () {
      const errors = [];
      if (!this.$v.lastName.$dirty) return errors;
      !this.$v.lastName.required && errors.push('Lastname is required.');
      return errors;
    },
    phoneErrors () {
      const errors = [];
      if (!this.$v.phone.$dirty) return errors;
      !this.$v.phone.required && errors.push('Phone is required.');
      !this.$v.phone.validPhone && errors.push('Invalid phone number.');
      return errors;
    },
    emailErrors () {
      const errors = [];
      if (!this.$v.email.$dirty) return errors;
      !this.$v.email.email && errors.push('Must be valid e-mail');
      !this.$v.email.required && errors.push('E-mail is required');
      return errors;
    },
    passwordErrors () {
      const errors = [];
      if (!this.$v.password.$dirty) return errors;
      !this.$v.password.required && errors.push('Password is required.');
      return errors;
    },
    passwordConfirmErrors () {
      const errors = [];
      if (!this.$v.passwordConfirm.$dirty) return errors;
      !this.$v.passwordConfirm.required && errors.push('Password is required.');
      !this.$v.passwordConfirm.match && errors.push('Passwords must match.');
      return errors;
    },
  },
  methods: {
    async submitForm () {
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }

      this.$emit('submit', {
        email: this.email,
        password: this.showPasswordField ? this.password : undefined,
        firstName: this.firstName,
        lastName: this.lastName,
        phone: this.phone,
        active: this.activeCheckbox,
        groups: [
          this.devCheckbox ? 'Developers' : '',
          this.adminCheckbox ? 'Administrators' : '',
          this.serviceCheckbox ? 'Service' : ''
        ].filter(x => !!x),
      });
    },
    showPasswordChangeFields (value) {
      this.wantsPasswordChange = value;
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
