<template>
  <form>
    <a @click="showDialog = true">Edit customer details</a>
    <br>

    <v-dialog v-model="showDialog" max-width="50%" @keydown.esc="showDialog = false">
      <v-toolbar color="blue" dark dense>
        <v-toolbar-title class="white--text">Edit customer's personal data</v-toolbar-title>
      </v-toolbar>
      <v-card tile>
        <v-card-text>
          <table>
            <tr>
              <td>Customer ID</td>
              <td>{{ data.id }}</td>
            </tr>
            <tr>
              <td>Email</td>
              <td>{{ data.email }}</td>
            </tr>
            <tr>
              <td>Forename</td>
              <td>
                <v-text-field
                  v-model="data.forename"
                  label="Forename"
                />
              </td>
            </tr>
            <tr>
              <td>Last name</td>
              <td>
                <v-text-field
                  v-model="data.lastname"
                  label="Last name"
                />
              </td>
            </tr>
            <tr>
              <td>Mobile phone number</td>
              <td>
                <v-text-field
                  v-model="data.mobile_nr"
                  label="Mobile phone number"
                />
              </td>
            </tr>
            <tr>
              <td>Address</td>
              <td>
                <v-text-field
                  v-model="data.address"
                  label="Address"
                />
              </td>
            </tr>
            <tr>
              <td>City</td>
              <td>
                <v-text-field
                  v-model="data.city"
                  label="City"
                />
              </td>
            </tr>
            <tr>
              <td>State</td>
              <td>
                <v-text-field
                  v-model="data.state"
                  label="State"
                />
              </td>
            </tr>
            <tr>
              <td>Country</td>
              <td>
                <v-select
                  :items="countryItems"
                  v-model="data.country"
                />
              </td>
            </tr>
            <tr>
              <td>Occupation</td>
              <td>
                <v-select
                  :items="occupationItems"
                  v-model="data.occupation"
                />
              </td>
            </tr>
            <tr>
              <td>Language</td>
              <td>
                <v-select
                  :items="languageItems"
                  v-model="data.language"
                />
              </td>
            </tr>
            <tr>
              <td>Salutation</td>
              <td>
                <v-select
                  :items="salutationItems"
                  v-model="data.salutation"
                />
              </td>
            </tr>
            <tr>
              <td>Nationality</td>
              <td>
                <v-text-field
                  v-model="data.nationality"
                  label="Nationality"
                />
              </td>
            </tr>
            <tr>
              <td>Birth day</td>
              <td>
                <v-text-field
                  v-model="data.birth_day"
                  label="Birth day"
                />
              </td>
            </tr>
            <tr>
              <td>Birth place</td>
              <td>
                <v-text-field
                  v-model="data.birth_place"
                  label="Birth place"
                />
              </td>
            </tr>
          </table>
          <v-btn color="okay" @click="submitForm">Create</v-btn>
          <v-btn color="okay" @click="submitForm">Cancel</v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>
  </form>
</template>

<script>
import { mapGetters } from 'vuex';
import { validationMixin } from 'vuelidate';

export default {
  name: 'CustomerEditData',
  mixins: [validationMixin],
  props: {
    customer: {
      type: Object,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    }
  },
  data () {
    return {
      data: {...this.customer},
      showDialog: false,
    };
  },
  computed: {
    ...mapGetters(['occupations', 'languages', 'salutations', 'countries']),
    occupationItems () {
      return this.occupations.map(occupation => ({ value: occupation.code08 + occupation.code88, text: occupation.name }));
    },
    languageItems () {
      return this.languages.map(language => ({ value: language.lang_code, text: language.lang_name }));
    },
    salutationItems () {
      return this.salutations.map(salutation => ({ value: salutation, text: salutation }));
    },
    countryItems () {
      return this.countries.map(country => ({ value: country.code, text: country.name }));
    }
  },
  validations () {
    return {

    };
  },
  methods: {
    async submitForm () {
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }

      this.$emit('submit', {
        id: this.customer.id,
        forename: this.data.forename,
        lastname: this.data.lastname,
        company: this.data.company,
        salutation: this.data.salutation,
        title: this.data.title,
        address: this.data.address,
        zip_code: this.data.zip_code,
        city: this.data.city,
        state: this.data.state,
        country_code: this.data.country_code,
        nationality: this.data.nationality,
        mobile_nr: this.data.mobile_nr,
        birth_day: this.data.birth_day,
        birth_place: this.data.birth_place,
        additional_name: this.data.additional_name,
        birth_country_code: this.data.birth_country_code,
        bank_account_number: this.data.bank_account_number,
        bank_number: this.data.bank_number,
        bank_phone_number: this.data.bank_phone_number,
        tax_id: this.data.tax_id,
        tax_id_name: this.data.tax_id_name,
        occupation: this.data.occupation,
        employer_name: this.data.employer_name,
        employer_address: this.data.employer_address,
        language_code: this.data.language_code,
      });
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
