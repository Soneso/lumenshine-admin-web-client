<template>
  <div>
    <strong>Signers:</strong> <a href="#" @click.prevent="onOpenForm('add')">add</a>
    <br>
    <v-layout row>
      <v-flex xs6 sm6>
        <v-layout row>
          <v-text-field
            v-model="nameFilter"
            append-icon="search"
            label="Name"
            hide-details
            persistent-hint
          />
        </v-layout>
        <v-layout row>
          <v-text-field
            v-model="signerPublicKeyFilter"
            append-icon="search"
            label="Public key"
            hide-details
            persistent-hint
          />
        </v-layout>
        <br>Type
        <v-layout row>
          <v-checkbox
            v-model="searchMaster"
            label="master"
          />
          <v-checkbox
            v-if="data.type === 'issuing'"
            v-model="searchAllowTrust"
            label="allow trust"
          />
          <v-checkbox
            v-model="searchOther"
            label="other"
          />
        </v-layout>
        <br>
      </v-flex>
    </v-layout>
    <table v-if="filteredSigners.length > 0" class="table">
      <thead>
        <th style="width: 25%;">Name / Public key</th>
        <th style="width: 25%;">Type</th>
        <th style="width: 25%;">Weight</th>
        <th style="width: 25%;"/>
      </thead>
      <tr v-for="signer in filteredSigners" :key="signer.public_key">
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
        <td>{{ signer.type }}</td>
        <td>{{ signer.weight }}</td>
        <td>
          <a v-if="signer.type !== 'master'" href="#" @click.prevent="onOpenForm('edit', signer)">Edit</a><br>
          <a href="#" @click.prevent="onOpenForm('change_weight', signer)">Change weight</a><br>
          <a v-if="signer.type !== 'master'" href="#" class="warning-text" @click.prevent="onOpenForm('remove', signer)">Remove</a><br>
          <a v-if="signer.type !== 'master' && signer.description" href="#" @click.prevent="onOpenForm('description', signer)">Show description</a><br>
        </td>
      </tr>
    </table>
    <account-signer-change-weight-form
      v-if="openedForm === 'change_weight'"
      :loading="loading"
      :signer="openedSigner"
      :data="data"
      :errors="errors"
      @updateSigner="params => $emit('updateSigner', params)"
      @reset="openedForm = null"
    />
    <account-add-signer-form
      v-if="openedForm === 'add'"
      :loading="loading"
      :data="data"
      :errors="errors"
      @addSigner="params => $emit('addSigner', params)"
      @reset="openedForm = null"
    />
    <account-signer-editor-form
      v-if="openedForm === 'edit'"
      :loading="loading"
      :signer="openedSigner"
      :data="data"
      :errors="errors"
      @updateSigner="params => $emit('updateSigner', params)"
      @reset="openedForm = null"
    />
    <account-signer-remove-form
      v-if="openedForm === 'remove'"
      :loading="loading"
      :signer="openedSigner"
      :data="data"
      :errors="errors"
      @removeSigner="params => $emit('removeSigner', params)"
      @reset="openedForm = null"
    />
    <v-dialog :value="openedForm === 'description'" max-width="50%" @keydown.esc="openedForm = null" @input="openedForm = null" >
      <v-toolbar color="primary" dark dense>
        <v-toolbar-title class="white--text">Signer description</v-toolbar-title>
      </v-toolbar>
      <v-card tile>
        <v-card-text>
          {{ openedSigner && openedSigner.description }}
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import AccountSignerChangeWeightForm from '@/forms/AccountSignerChangeWeightForm';
import AccountAddSignerForm from '@/forms/AccountAddSignerForm';
import AccountSignerEditorForm from '@/forms/AccountSignerEditorForm';
import AccountSignerRemoveForm from '@/forms/AccountSignerRemoveForm';

export default {
  components: { AccountSignerChangeWeightForm, AccountAddSignerForm, AccountSignerEditorForm, AccountSignerRemoveForm },
  props: {
    data: {
      type: Object,
      default: () => ({})
    },
    loading: {
      type: Boolean,
      required: true,
    },
    errors: {
      type: Array,
      default: () => []
    },
  },
  data () {
    return {
      nameFilter: '',
      signerPublicKeyFilter: '',
      searchMaster: false,
      searchAllowTrust: false,
      searchOther: false,

      copiedAccount: null,
      openedForm: null,
      openedSigner: null,
    };
  },
  computed: {
    extendedAllowTrustSigners () {
      if (!this.data.allow_trust_signers) return [];
      return this.data.allow_trust_signers.map(signer => {
        const stellarSigner = this.data.signers.find(s => s.public_key === signer.public_key);
        return {
          ...signer,
          weight: stellarSigner ? stellarSigner.weight : undefined,
          type: 'allow_trust'
        };
      });
    },
    extendedOtherSigners () {
      if (!this.data.other_signers) return [];
      return this.data.other_signers.map(signer => {
        const stellarSigner = this.data.signers.find(s => s.public_key === signer.public_key);
        return {
          ...signer,
          weight: stellarSigner ? stellarSigner.weight : undefined,
          type: 'other',
        };
      });
    },
    extendedMasterSigner () {
      const stellarSigner = this.data.signers.find(s => s.public_key === this.data.public_key);
      return {
        ...stellarSigner,
        type: 'master'
      };
    },
    extendedSigners () {
      return [this.extendedMasterSigner, ...this.extendedAllowTrustSigners, ...this.extendedOtherSigners];
    },
    filteredSigners () {
      return this.extendedSigners.filter(item => {
        if (item.name !== undefined && this.nameFilter !== '' && item.name.indexOf(this.nameFilter) === -1) return false;
        if (this.signerPublicKeyFilter !== '' && item.public_key.indexOf(this.signerPublicKeyFilter) === -1) return false;
        if (this.searchMaster || this.searchAllowTrust || this.searchOther) {
          if (!this.searchMaster && item.type === 'master') return false;
          if (!this.searchAllowTrust && item.type === 'allow_trust') return false;
          if (!this.searchOther && item.type === 'other') return false;
        }
        return true;
      });
    }
  },
  methods: {
    onCopy (account) {
      this.copiedAccount = account;
    },
    onOpenForm (type, signer) {
      this.openedForm = type;
      this.openedSigner = signer;
    }
  }
};
</script>

<style lang="scss" scoped>
table {
  width: 100%;
  table-layout: fixed;
  vertical-align: center;
  thead th {
    border-bottom: 1px solid #aaa;
  }
  td {
    text-align: center;
    word-break: break-all;
    vertical-align: center;
    border-bottom: 1px dotted #aaa;
  }
}
</style>
