<script setup>
import { useAuthStore } from "@/stores/auth.js";

const authStore = useAuthStore();
</script>

<template>
  <div class="not-found d-flex flex-column justify-content-center">
    <h1 class="not-found__code fs-3">Esta página não está disponível.</h1>
    <p class="not-found__subtitle">
      O link em que você clicou pode não estar funcionando, ou a página pode ter
      sido removida.<RouterLink
        v-if="authStore.isAuthenticated"
        to="/feed"
        class="not-found__btn"
      >
        Voltar para o instagram
      </RouterLink>

      <RouterLink v-else to="/login" class="not-found__btn">
        Fazer login
      </RouterLink>
    </p>
  </div>
</template>

<style scoped>
.not-found {
  min-height: 100vh;
  text-align: center;
  padding: 24px 16px;
  background: var(--color-bg);
}

.not-found__subtitle {
  color: var(--color-text-muted);
}

.not-found__btn {
  color: var(--color-primary);
}
</style>
