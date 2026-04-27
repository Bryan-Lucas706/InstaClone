<script setup>
import { useAuthStore } from '@/stores/auth.js'

const authStore = useAuthStore()
</script>

<template>
  <div class="not-found d-flex flex-column align-items-center justify-content-center">
    <h1 class="not-found__code">404</h1>
    <p class="not-found__title">Página não encontrada</p>
    <p class="not-found__subtitle">
      A página que você está procurando não existe ou foi removida.
    </p>

    <RouterLink
      v-if="authStore.isAuthenticated"
      to="/feed"
      class="btn not-found__btn"
    >
      Voltar ao feed
    </RouterLink>

    <RouterLink
      v-else
      to="/login"
      class="btn not-found__btn"
    >
      Fazer login
    </RouterLink>
  </div>
</template>

<style scoped>
.not-found {
  min-height: 100vh;
  text-align: center;
  padding: 24px 16px;
  background: var(--color-bg);
}

.not-found__code {
  font-size: 96px;
  font-weight: 700;
  background: linear-gradient(
    45deg,
    var(--color-gradient-start),
    var(--color-gradient-mid),
    var(--color-gradient-end)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  margin-bottom: 16px;
}

.not-found__title {
  font-size: 22px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 8px;
}

.not-found__subtitle {
  font-size: 14px;
  color: var(--color-text-muted);
  margin-bottom: 24px;
}

.not-found__btn {
  background: var(--color-primary);
  color: #fff;
  font-weight: 600;
  padding: 10px 24px;
}

.not-found__btn:hover {
  background: var(--color-primary-hover);
  color: #fff;
}
</style>