<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  src: {
    type: String,
    default: "",
  },
  alt: {
    type: String,
    default: "",
  },
  size: {
    type: String,
    default: "md",
    validator: (v) => ["sm", "md", "lg"].includes(v),
  },
});

const sizeMap = { sm: "28px", md: "38px", lg: "80px" };
const dimension = computed(() => sizeMap[props.size]);

// Controla se a imagem falhou ao carregar
const imgError = ref(false);

function onError() {
  imgError.value = true;
}

// Exibe a inicial do alt como fallback quando:
const showFallback = computed(() => !props.src || imgError.value);
</script>

<template>
  <div
    class="avatar"
    :style="{ width: dimension, height: dimension }"
    :aria-label="alt"
  >
    <!-- Imagem real -->
    <img v-if="!showFallback" :src="src" :alt="alt" @error="onError" />
    <!-- Fallback: círculo colorido com inicial -->
    <div v-else class="avatar__fallback">
      <img src="@/assets/images/avatarDefault.jpg" alt="Foto de perfil Defalt" />
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
