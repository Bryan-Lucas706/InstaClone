<script setup>
import { ref } from 'vue'

const emit = defineEmits(['comment-added'])

const body = ref('')

function handleSubmit() {
  const text = body.value.trim()
  if (!text) return
  emit('comment-added', text)
  body.value = ''
}
</script>

<template>
  <div class="d-flex align-items-center gap-2 p-3 comment-input-wrap">
    <input
      v-model="body"
      type="text"
      class="form-control border-0 bg-transparent p-0"
      placeholder="Adicione um comentário..."
      aria-label="Adicione um comentário"
      @keydown.enter.prevent="handleSubmit"
    />
    <button
      class="btn btn-link p-0 fw-semibold flex-shrink-0"
      style="font-size: 14px; color: var(--color-primary);"
      :disabled="!body.trim()"
      @click="handleSubmit"
    >
      Publicar
    </button>
  </div>
</template>

<style scoped>
.comment-input-wrap {
  border-top: 1px solid var(--color-border);
}

.form-control:focus {
  box-shadow: none;
}
</style>