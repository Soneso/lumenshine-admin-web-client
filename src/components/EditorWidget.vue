<template>
  <div>
    <slot name="header"/>
    <slot v-if="!editorOpen && !showEditForm"/>
    <slot v-else name="editor"/>
    <v-btn v-if="!editorOpen && !showEditForm" @click="onEdit">{{ buttonText }}</v-btn>
    <v-btn v-if="editorOpen || showEditForm" @click="onSave">Save</v-btn>
    <v-btn v-if="editorOpen || showEditForm" @click="onCancel">Cancel</v-btn>
  </div>
</template>
<script>
export default {
  name: 'EditorWidget',
  props: {
    hasError: {
      type: Boolean,
      required: true,
    },
    buttonText: {
      type: String,
      default: 'Edit',
    },
    showEditForm: {
      type: Boolean,
      default: false,
    }
  },
  data () {
    return {
      editorOpen: false,
    };
  },
  methods: {
    onEdit () {
      this.editorOpen = true;
    },
    onSave () {
      if (!this.hasError) {
        this.editorOpen = false;
      }
      this.$emit('submit');
    },
    onCancel () {
      this.$emit('cancel');
      this.editorOpen = false;
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
