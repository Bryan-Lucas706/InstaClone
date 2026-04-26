<script setup>
import { ref, computed } from "vue";
import { useAuthStore } from "@/stores/auth.js";
import Avatar from "@/components/ui/Avatar.vue";

const authStore = useAuthStore();

const user = computed(() => authStore.user);

const isActive = ref(false);
</script>

<template>
  <nav class="navbar" aria-label="Navegação principal">
    <!-- Home -->
    <RouterLink to="/feed" class="navbar__item" aria-label="Feed">
      <i class="fa-regular fa-house"></i>
      <span class="navbar__label">Home</span>
    </RouterLink>

    <!-- Buscar -->
    <RouterLink to="/discover" class="navbar__item" aria-label="Buscar">
      <i class="fa-solid fa-magnifying-glass"></i>
      <span class="navbar__label">Buscar</span>
    </RouterLink>

    <!-- create -->
    <RouterLink to="/create" class="navbar__item" aria-label="Criar post">
      <i class="fa-solid fa-plus"></i>
      <span class="navbar__label">Criar</span>
    </RouterLink>

    <!-- Perfil -->
    <RouterLink to="/profile" class="navbar__item" aria-label="Meu perfil">
      <div class="navbar__avatar">
        <Avatar
          :src="user?.avatar_url"
          :alt="user?.username ?? 'profile'"
          size="sm"
        />
      </div>
      <span class="navbar__label">Perfil</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
/* ── Mobile first: navbar fixa na base ── */
.navbar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: var(--navbar-height);
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-around;
  z-index: 1;

  & i {
    font-size: 1.5em;
  }
}

.navbar__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  color: var(--color-text);
  border-radius: var(--radius-md);
  transition: opacity var(--transition-fast);
}

.navbar__item:hover {
  background-color: #f3f3f3;
}

.navbar__label {
  font-size: 10px;
  font-weight: 500;
}

/* ── Desktop: sidebar fixa na esquerda ── */
@media (min-width: 768px) {
  .navbar {
    top: 0;
    bottom: auto;
    left: 0;
    width: 72px;
    height: 100vh;
    border-top: none;
    border-right: 1px solid var(--color-border);
    flex-direction: column;
    justify-content: center;
    gap: 10px;
  }

  .navbar__item {
    padding: 12px;
  }

  .navbar__label {
    display: none;
  }

  /* Em telas maiores, exibe label ao lado do ícone */
  @media (min-width: 1024px) {
    .navbar {
      width: 220px;
      align-items: flex-start;
      padding: 20px 12px;
    }

    .navbar__item {
      flex-direction: row;
      gap: 12px;
      width: 100%;
    }

    .navbar__label {
      display: block;
      font-size: 14px;
      font-weight: 400;
    }
  }
}
</style>
