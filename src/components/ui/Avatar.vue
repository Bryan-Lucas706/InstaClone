<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  src: {
    type: String,
    default: '',
  },
  alt: {
    type: String,
    default: '',
  },
  // Tamanhos pré-definidos para manter consistência visual
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v),
  },
})

// Mapeia o nome do tamanho para pixels
const sizeMap = { sm: '32px', md: '44px', lg: '80px' }
const dimension = computed(() => sizeMap[props.size])

// Controla se a imagem falhou ao carregar
const imgError = ref(false)

function onError() {
  imgError.value = true
}

// Exibe a inicial do alt como fallback quando:
// 1. Não há src informado
// 2. A imagem falhou ao carregar (404, URL inválida, etc.)
const showFallback = computed(() => !props.src || imgError.value)

// Pega a primeira letra do alt para o fallback
const initial = computed(() =>
  props.alt ? props.alt.charAt(0).toUpperCase() : '?'
)

// Gera uma cor de fundo baseada no texto do alt.
// Isso garante que o mesmo usuário sempre tenha a mesma cor,
// tornando o fallback visualmente identificável.
const fallbackColor = computed(() => {
  const colors = [
    '#e91e63', '#9c27b0', '#3f51b5', '#2196f3',
    '#009688', '#4caf50', '#ff9800', '#795548',
  ]
  if (!props.alt) return colors[0]
  const index = props.alt.charCodeAt(0) % colors.length
  return colors[index]
})

</script>

<template>
  <div
    class="avatar"
    :style="{ width: dimension, height: dimension }"
    :aria-label="alt"
  >
    <!-- Imagem real -->
    <img
      v-if="!showFallback"
      :src="src"
      :alt="alt"
      @error="onError"
    />

    <!-- Fallback: círculo colorido com inicial -->
    <div
      v-else
      class="avatar__fallback"
      :style="{ backgroundColor: fallbackColor }"
    >
      {{ initial }}
    </div>
  </div>
</template>

<style scoped>
.avatar {
  border-radius: var(--radius-full);
  overflow: hidden;
  flex-shrink: 0;
  display: inline-flex;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar__fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 600;
  font-size: 0.85em;
  text-transform: uppercase;
}
</style>