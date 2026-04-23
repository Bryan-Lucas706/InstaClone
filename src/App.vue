<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.js'
import { useFeedStore } from '@/stores/feed.js'

const authStore = useAuthStore()
const feedStore = useFeedStore()

// Hidrata a sessão ao carregar o app.
// Se existir token no localStorage, fetchMe() é chamado
// para restaurar os dados do usuário sem precisar logar novamente.
onMounted(async () => {
  await authStore.init()
})
</script>

<template>
  <RouterView v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </RouterView>
</template>

<style>
@import '@/assets/styles/theme.css';
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-normal);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>