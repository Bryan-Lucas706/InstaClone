<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v),
  },
})

const sizeMap = { sm: '16px', md: '24px', lg: '40px' }
const dimension = computed(() => sizeMap[props.size])
</script>

<template>
  <div
    class="spinner"
    :style="{ width: dimension, height: dimension }"
    role="status"
    aria-label="Carregando"
  >
    <span class="visually-hidden">Carregando...</span>
  </div>
</template>

<style scoped>
.spinner {
  border: 2px solid var(--color-border);
  border-top-color: currentColor;
  border-radius: var(--radius-full);
  animation: spin 0.7s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>