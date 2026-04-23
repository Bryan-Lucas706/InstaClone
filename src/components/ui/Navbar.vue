<script setup>
import { computed } from "vue";
import { useAuthStore } from "@/stores/auth.js";
import Avatar from "@/components/ui/Avatar.vue";

const authStore = useAuthStore();

const user = computed(() => authStore.user);

console.log(user.value?.username)
</script>

<template>
  <nav class="navbar" aria-label="Navegação principal">
    <!-- Home -->
    <RouterLink to="/feed" class="navbar__item" aria-label="Feed">
      <svg
        class="navbar__icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        xmlns="http://www.w3.org/2000/svg"
      >
        <!-- Ícone outline (inativo) -->
        <path
          class="icon-outline"
          d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"
        />
        <path class="icon-outline" d="M9 21V12h6v9" />
        <!-- Ícone filled (ativo) — oculto por padrão -->
        <path
          class="icon-filled"
          d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"
          fill="currentColor"
        />
        <path class="icon-filled" d="M9 21V12h6v9" stroke="white" />
      </svg>
      <span class="navbar__label">Home</span>
    </RouterLink>

    <!-- Buscar -->
    <RouterLink to="/descobrir" class="navbar__item" aria-label="Buscar">
      <svg
        class="navbar__icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle class="icon-outline" cx="11" cy="11" r="8" />
        <line class="icon-outline" x1="21" y1="21" x2="16.65" y2="16.65" />
        <circle class="icon-filled" cx="11" cy="11" r="8" fill="currentColor" />
        <line
          class="icon-filled"
          x1="21"
          y1="21"
          x2="16.65"
          y2="16.65"
          stroke="white"
          stroke-width="2.5"
        />
      </svg>
      <span class="navbar__label">Buscar</span>
    </RouterLink>

    <!-- Criar -->
    <RouterLink to="/criar" class="navbar__item" aria-label="Criar post">
      <svg
        class="navbar__icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect class="icon-outline" x="3" y="3" width="18" height="18" rx="4" />
        <line class="icon-outline" x1="12" y1="8" x2="12" y2="16" />
        <line class="icon-outline" x1="8" y1="12" x2="16" y2="12" />
        <rect
          class="icon-filled"
          x="3"
          y="3"
          width="18"
          height="18"
          rx="4"
          fill="currentColor"
        />
        <line
          class="icon-filled"
          x1="12"
          y1="8"
          x2="12"
          y2="16"
          stroke="white"
          stroke-width="2.5"
        />
        <line
          class="icon-filled"
          x1="8"
          y1="12"
          x2="16"
          y2="12"
          stroke="white"
          stroke-width="2.5"
        />
      </svg>
      <span class="navbar__label">Criar</span>
    </RouterLink>

    <!-- Perfil -->
    <RouterLink to="/perfil" class="navbar__item" aria-label="Meu perfil">
      <div class="navbar__avatar-wrap">
        <Avatar
          :src="user?.avatar"
          :alt="user?.username ?? 'perfil'"
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
  z-index: 100;
}

.navbar__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  color: var(--color-text);
  border-radius: var(--radius-sm);
  transition: opacity var(--transition-fast);
}

.navbar__item:hover {
  opacity: 0.7;
}

.navbar__icon {
  width: 24px;
  height: 24px;
}

/* Por padrão mostra outline, esconde filled */
.icon-filled {
  display: none;
}

/* Quando o link está ativo, troca outline por filled */
.router-link-active .icon-outline {
  display: none;
}

.router-link-active .icon-filled {
  display: block;
}

.navbar__label {
  font-size: 10px;
  font-weight: 500;
}

/* Anel de destaque no avatar quando perfil está ativo */
.navbar__avatar-wrap {
  border-radius: var(--radius-full);
  padding: 1px;
  border: 2px solid transparent;
  transition: border-color var(--transition-fast);
}

.router-link-active .navbar__avatar-wrap {
  border-color: var(--color-text);
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
    justify-content: flex-start;
    padding: 20px 0;
    gap: 4px;
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
      padding: 12px;
    }

    .navbar__label {
      font-size: 14px;
      font-weight: 400;
    }
  }

  .navbar__item {
    padding: 12px;
  }

  .navbar__label {
    display: none;
  }

  @media (min-width: 1024px) {
    .navbar__label {
      display: block;
    }
  }
}
</style>
