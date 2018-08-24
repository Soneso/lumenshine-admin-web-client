<template>
  <div class="editor-widget">
    <slot name="header"/>
    <a v-if="!editorOpen && !showEditForm" @click="onEdit">{{ buttonText }}</a>
    <a v-if="editorOpen || showEditForm" class="success-text" @click="onSave">Save</a>
    <a v-if="editorOpen || showEditForm" class="warning-text" @click="onCancel">Cancel</a>
    <br>
    <slot v-if="!editorOpen && !showEditForm"/>
    <slot v-else name="editor"/>
    <br><br>
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
a {
  padding: 0 10px;
}
.editor-widget {
  width: 100%;
}
</style>
