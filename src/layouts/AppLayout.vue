<script setup>
import Navbar from '@/components/ui/Navbar.vue'
</script>

<template>
  <div class="app-layout">
    <Navbar />

    <!-- Conteúdo principal com espaço para não sobrepor a navbar -->
    <main class="app-layout__main">
      <RouterView v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </RouterView>
    </main>
  </div>
</template>

<style scoped>
.app-layout__main {
  /* Espaço inferior no mobile para a navbar fixa não sobrepor */
  padding-bottom: var(--navbar-height);
  min-height: 100vh;
}

/* No desktop, empurra o conteúdo para a direita da sidebar */
@media (min-width: 768px) {
  .app-layout {
    display: flex;
  }

  .app-layout__main {
    margin-left: 72px;
    padding-bottom: 0;
    flex: 1;
  }
}

@media (min-width: 768px) {
  .app-layout__main {
    margin-left: 150px;
  }
}
</style>

<style>
/* Global — transição de rota dentro do AppLayout */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-normal);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>