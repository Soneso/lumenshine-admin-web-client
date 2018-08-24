<template>
  <form v-if="pendingDelete === null">
    <editor-widget
      v-if="data.type === 'issuing'"
      :show-edit-form="editingSigner === 'allowtrust'"
      :has-error="$v.signerName.$invalid || $v.signerDescription.$invalid || $v.signerPublicKey.$invalid || $v.signerSecret.$invalid"
      button-text="Add new allow trust signer"
      @cancel="onCancel"
      @submit="addAllowTrustSigner">
      <template slot="header">
        <div><strong>Allow trust signers:</strong></div>
      </template>
      <table v-if="extendedAllowTrustSigners.length > 0" class="table">
        <thead>
          <th>Name / Public key</th>
          <th>Type</th>
          <th>Weight</th>
          <th>Actions</th>
        </thead>
        <tr v-for="signer in extendedAllowTrustSigners" :key="signer.public_key">
          <td>
            {{ signer.name }}<br>
            {{ signer.public_key }}
            <a
              v-clipboard:copy="signer.public_key"
              v-clipboard:success="() => onCopy(signer.public_key)"
              class="wallet-link">
              <v-icon>file_copy</v-icon>
            </a>
            <span v-if="signer.public_key === copiedAccount">Copied</span>
          </td>
          <td>allow trust</td>
          <td>{{ signer.weight }}</td>
          <td>
            <a href="#" class="warning-text" @click="onOpenDeleteForm(signer.public_key, 'allowtrust')">Remove</a>
          </td>
        </tr>
      </table>
      <div v-if="extendedAllowTrustSigners.length > 0">
        <br><hr><br>
      </div>
      <template slot="editor">
        <v-text-field
          v-model="signerName"
          :error-messages="signerNameErrors"
          label="Name"
          required
          @input="$v.signerName.$touch()"
          @blur="$v.signerName.$touch()"
        />
        <v-text-field
          v-model="signerDescription"
          :error-messages="signerDescriptionErrors"
          label="Description"
          @input="$v.signerDescription.$touch()"
          @blur="$v.signerDescription.$touch()"
        />
        <v-text-field
          v-model="signerPublicKey"
          :error-messages="signerPublicKeyErrors"
          label="Signer public key"
          required
          @input="$v.signerPublicKey.$touch()"
          @blur="$v.signerPublicKey.$touch()"
        />
        <v-text-field
          v-model="signerSecret"
          :error-messages="signerSecretErrors"
          label="Secret seed"
          @input="$v.signerSecret.$touch()"
          @blur="$v.signerSecret.$touch()"
        />
        <v-text-field
          v-model="signerWeight"
          :error-messages="signerWeightErrors"
          label="Signer key weight"
          required
          @input="$v.signerWeight.$touch()"
          @blur="$v.signerWeight.$touch()"
        />
        <v-text-field
          v-model="secret"
          :error-messages="secretErrors"
          label="Issuing account secret seed"
          required
          @input="$v.secret.$touch()"
          @blur="$v.secret.$touch()"
        />
        <br><hr><br>
      </template>
    </editor-widget>

    <editor-widget
      :show-edit-form="editingSigner === 'other'"
      :has-error="$v.signerName.$invalid || $v.signerDescription.$invalid || $v.signerPublicKey.$invalid || $v.signerSecret.$invalid"
      button-text="Add new other signer"
      @cancel="onCancel"
      @submit="addOtherSigner">
      <template slot="header">
        <div><strong>Other signers:</strong></div>
      </template>
      <table v-if="extendedOtherSigners.length > 0" class="table">
        <thead>
          <th>Name / Public key</th>
          <th>Type</th>
          <th>Weight</th>
          <th>Actions</th>
        </thead>
        <tr v-for="signer in extendedOtherSigners" :key="signer.public_key">
          <td>
            {{ signer.name }}<br>
            {{ signer.public_key }}
            <a
              v-clipboard:copy="signer.public_key"
              v-clipboard:success="() => onCopy(signer.public_key)"
              class="wallet-link">
              <v-icon>file_copy</v-icon>
            </a>
            <span v-if="signer.public_key === copiedAccount">Copied</span>
          </td>
          <td>other</td>
          <td>{{ signer.weight }}</td>
          <td>
            <a href="#" class="warning-text" @click="onOpenDeleteForm(signer.public_key, 'other')">Remove</a>
          </td>
        </tr>
      </table>
      <template slot="editor">
        <v-text-field
          v-model="signerName"
          :error-messages="signerNameErrors"
          label="Name"
          required
          @input="$v.signerName.$touch()"
          @blur="$v.signerName.$touch()"
        />
        <v-text-field
          v-model="signerDescription"
          :error-messages="signerDescriptionErrors"
          label="Description"
          @input="$v.signerDescription.$touch()"
          @blur="$v.signerDescription.$touch()"
        />
        <v-text-field
          v-model="signerPublicKey"
          :error-messages="signerPublicKeyErrors"
          label="Signer public key"
          required
          @input="$v.signerPublicKey.$touch()"
          @blur="$v.signerPublicKey.$touch()"
        />
        <v-text-field
          v-model="signerSecret"
          :error-messages="signerSecretErrors"
          label="Signer secret seed"
          @input="$v.signerSecret.$touch()"
          @blur="$v.signerSecret.$touch()"
        />
        <v-text-field
          v-model="signerWeight"
          :error-messages="signerWeightErrors"
          label="Signer key weight"
          required
          @input="$v.signerWeight.$touch()"
          @blur="$v.signerWeight.$touch()"
        />
        <v-text-field
          v-model="secret"
          :error-messages="secretErrors"
          label="Issuing account secret seed"
          required
          @input="$v.secret.$touch()"
          @blur="$v.secret.$touch()"
        />
      </template>
    </editor-widget>
  </form>
  <form v-else>
    <h3>Deleting signer</h3>
    <v-text-field
      v-model="secret"
      :error-messages="secretErrors"
      label="Issuing account secret seed"
      required
      @input="$v.secret.$touch()"
      @blur="$v.secret.$touch()"
    />
    <v-btn @click="onDeleteSigner">Delete</v-btn>
    <v-btn @click="onCancel">Cancel</v-btn>
  </form>
</template>

<script>
import { validationMixin } from 'vuelidate';
import { required, integer, between } from 'vuelidate/lib/validators';

import { publicKey as validPublicKey, secretSeed as validSecretSeed } from '@/util/validators';

import EditorWidget from '@/components/EditorWidget';

export default {
  name: 'AccountSignersForm',
  components: { EditorWidget },
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
  },

  validations () {
    const base = {
      secret: { required, validSecretSeed },
    };

    const add = {
      signerName: { required },
      signerDescription: {},
      signerPublicKey: { required, validPublicKey },
      signerSecret: { required, validSecretSeed },
      signerWeight: { required, integer, between: between(0, 255) }
    };

    return !this.pendingDelete ? {...base, ...add} : base;
  },

  data () {
    return {
      pendingDelete: null,

      editingSigner: false,

      allowTrustSigners: this.data.allow_trust_signers,
      otherSigners: this.data.other_signers,

      signerName: '',
      signerDescription: '',
      signerPublicKey: '',
      signerSecret: '',
      signerWeight: 1,
      secret: '',

      copiedAccount: null,
    };
  },
  computed: {
    extendedAllowTrustSigners () {
      if (!this.data.allow_trust_signers) return [];
      return this.data.allow_trust_signers.map(signer => {
        const stellarSigner = this.data.signers.find(s => s.public_key === signer.public_key);
        return {
          ...signer,
          weight: stellarSigner ? stellarSigner.weight : undefined
        };
      });
    },
    extendedOtherSigners () {
      if (!this.data.other_signers) return [];
      return this.data.other_signers.map(signer => {
        const stellarSigner = this.data.signers.find(s => s.public_key === signer.public_key);
        return {
          ...signer,
          weight: stellarSigner ? stellarSigner.weight : undefined
        };
      });
    },
    signerNameErrors () {
      const errors = [];
      if (!this.$v.signerName.$dirty) return errors;
      !this.$v.signerName.required && errors.push('Signer name is required.');
      return errors;
    },
    signerDescriptionErrors () {
      const errors = [];
      if (!this.$v.signerDescription.$dirty) return errors;
      return errors;
    },
    signerPublicKeyErrors () {
      const errors = [];
      if (!this.$v.signerPublicKey.$dirty) return errors;
      !this.$v.signerPublicKey.required && errors.push('Public key is required.');
      !this.$v.signerPublicKey.validPublicKey && errors.push('Invalid public key.');
      return errors;
    },
    signerSecretErrors () {
      const errors = [];
      if (!this.$v.signerSecret.$dirty) return errors;
      !this.$v.signerSecret.required && errors.push('Secret is required.');
      !this.$v.signerSecret.validSecretSeed && errors.push('Invalid secret seed.');
      return errors;
    },
    signerWeightErrors () {
      const errors = [];
      if (!this.$v.signerWeight.$dirty) return errors;
      !this.$v.signerWeight.required && errors.push('Weight is required.');
      !this.$v.signerWeight.integer && errors.push('Weight should be a number.');
      !this.$v.signerWeight.between && errors.push('Weight should be a number between 0 and 255.');
      return errors;
    },
    secretErrors () {
      const errors = [];
      if (!this.$v.secret.$dirty) return errors;
      !this.$v.secret.required && errors.push('Secret is required.');
      !this.$v.secret.validSecretSeed && errors.push('Invalid secret seed.');
      return errors;
    },
  },
  methods: {
    addAllowTrustSigner () {
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }
      this.$emit('addAllowTrustSigner', {
        name: this.signerName,
        description: this.signerDescription,
        publicKey: this.signerPublicKey,
        secret: this.signerSecret,
        weight: this.signerWeight,
        issuingSecret: this.secret,
      });
      this.secret = '';
    },
    addOtherSigner () {
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }
      this.$emit('addOtherSigner', {
        name: this.signerName,
        description: this.signerDescription,
        publicKey: this.signerPublicKey,
        secret: this.signerSecret,
        weight: this.signerWeight,
        issuingSecret: this.secret,
      });
      this.secret = '';
    },
    onOpenDeleteForm (publicKey, type) {
      this.pendingDelete = { publicKey, type };
    },
    onDeleteSigner () {
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      }
      if (this.pendingDelete.type === 'allowtrust') {
        this.$emit('deleteAllowTrustSigner', { publicKey: this.pendingDelete.publicKey, issuingSecret: this.secret });
      } else {
        this.$emit('deleteOtherSigner', { publicKey: this.pendingDelete.publicKey, issuingSecret: this.secret });
      }

      this.secret = '';
      this.pendingDelete = null;
    },
    onCancel () {
      this.pendingDelete = null;
      this.editingSigner = false;

      this.signerName = '';
      this.signerDescription = '';
      this.signerPublicKey = '';
      this.signerSecret = '';
      this.signerWeight = 1;
      this.secret = '';

      this.$v.$reset();
    },
    onCopy (account) {
      this.copiedAccount = account;
    },
  }
};
</script>

<style lang="scss" scoped>
.table {
  border-collapse: collapse;
  text-align: left;
  width: 100%;
  box-sizing: border-box;
  th {
    border-bottom: 1px solid #aaa;
  }
  td, th {
    padding: 10px;
    word-break: break-word;
  }
}
</style>
