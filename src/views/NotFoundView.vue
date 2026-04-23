<script setup>
import { useAuthStore } from '@/stores/auth.js'
const authStore = useAuthStore()
</script>

<template>
  <div style="text-align: center; padding: 60px 16px;">
    <h1>404</h1>
    <p>Página não encontrada.</p>
    <RouterLink v-if="authStore.isAuthenticated" to="/feed">
      Voltar ao feed
    </RouterLink>
    <RouterLink v-else to="/login">
      Fazer login
    </RouterLink>
  </div>
</template>