<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth.js";
import api from "@/services/api.js";
import Avatar from "@/components/ui/Avatar.vue";
import Spinner from "@/components/ui/Spinner.vue";

const router = useRouter();
const authStore = useAuthStore();

// ── Estado local ─────────────────────────────────────────
const users = ref([]);
const isLoading = ref(false);
const isLoadingMore = ref(false);
const currentPage = ref(1);
const hasMore = ref(false);
const errorMessage = ref("");
const searchQuery = ref("");

// Guarda o estado de loading individual por usuário
// para o botão de seguir mostrar spinner separado por card
const loadingFollow = ref({});

// fetchUsers() — busca usuários sugeridos via GET /users/search.

async function fetchUsers(page) {
  if (searchQuery.value.length === 1) return;
  if (page === 1) {
    isLoading.value = true;
  } else {
    isLoadingMore.value = true;
  }
  errorMessage.value = "";

  try {
    const { data } = await api.get("/users/search", {
      params: { q: searchQuery.value || "...", per_page: 10, page },
    });

    
    const filtered = data.data.filter((u) => u.id !== authStore.user?.id);

    // Busca estado de seguir para cada usuário em paralelo
    const withFollowState = await Promise.all(
      filtered.map(async (u) => {
        try {
          const res = await api.get(`/users/${u.id}/is-following`);
          return { ...u, isFollowing: res.data.is_following };
        } catch {
          return { ...u, isFollowing: false };
        }
      }),
    );

    if (page === 1) {
      users.value = withFollowState;
    } else {
      users.value.push(...withFollowState);
    }

    currentPage.value = page;
    // next_page_url indica se há mais páginas
    hasMore.value = !!data.next_page_url;
  } catch {
    errorMessage.value = "Erro ao carregar usuários.";
  } finally {
    isLoading.value = false;
    isLoadingMore.value = false;
  }
}

// Atualização otimista: muda o estado antes da resposta da API.
async function toggleFollow(user) {
  loadingFollow.value[user.id] = true;

  const wasFollowing = user.isFollowing;
  // Atualização otimista
  user.isFollowing = !wasFollowing;

  try {
    if (wasFollowing) {
      await api.delete(`/users/${user.id}/follow`);
    } else {
      await api.post(`/users/${user.id}/follow`);
    }
  } catch {
    // Reverte em caso de erro
    user.isFollowing = wasFollowing;
  } finally {
    loadingFollow.value[user.id] = false;
  }
}

function goToProfile(user) {
  if (user.username === authStore.user?.username) {
    router.push("/profile");
  } else {
    router.push(`/profile?user=${user.username}`);
  }
}
</script>

<template>
  <div class="container py-4" style="max-width: 614px">
    <h1 class="fw-semibold mb-4 fs-5">Descobrir pessoas</h1>
    <input
      v-model="searchQuery"
      type="text"
      class="mb-3"
      placeholder="Buscar pessoas..."
      @input="fetchUsers(1)"
    />
    <!-- Skeleton loader -->
    <template v-if="isLoading">
      <div
        v-for="n in users"
        :key="n"
        class="skeleton_user d-flex align-items-center gap-3 p-3 mb-2 rounded"
      >
        <div class="skeleton_avatar rounded-circle" />
        <div class="flex-grow-1 d-flex flex-column gap-2">
          <div class="rounded skeleton_username" />
          <div class="rounded skeleton_name" />
        </div>
      </div>
    </template>

    <!-- Lista de usuários -->
    <template v-else-if="users.length > 0">
      <div
        v-for="user in users"
        :key="user.id"
        class="user d-flex align-items-center gap-3 p-3 mb-2 rounded"
        style=""
      >
        <!-- Avatar + info — clicável para o perfil -->
        <div
          class="d-flex align-items-center gap-3 flex-grow-1 overflow-hidden"
          @click="goToProfile(user)"
        >
          <Avatar :src="user.avatar_url" :alt="user.username" size="md" />
          <div class="overflow-hidden">
            <p class="mb-0 fw-semibold text-ellipsis" style="font-size: 14px">
              {{ user.username }}
            </p>
            <p
              class="mb-0 text-ellipsis"
              style="font-size: 12px; color: var(--color-text-muted)"
            >
              {{ user.name }}
            </p>
          </div>
        </div>

        <!-- Botão seguir/seguindo -->
        <button
          class="btn btn-sm flex-shrink-0"
          :class="user.isFollowing ? 'seguindo_btn' : 'seguir_btn'"
          :disabled="loadingFollow[user.id]"
          @click.stop="toggleFollow(user)"
        >
          <Spinner v-if="loadingFollow[user.id]" size="sm" />
          <span v-else>{{ user.isFollowing ? "Seguindo" : "Seguir" }}</span>
        </button>
      </div>

      <!-- Carregar mais -->
      <div v-if="hasMore" class="d-flex justify-content-center mt-3">
        <button
          class="btn"
          style="color: var(--color-primary); font-weight: 600"
          :disabled="isLoadingMore"
          @click="fetchUsers(currentPage + 1)"
        >
          <Spinner v-if="isLoadingMore" size="sm" class="me-2" />
          {{ isLoadingMore ? "Carregando..." : "Carregar mais" }}
        </button>
      </div>
    </template>

    <!-- Erro -->
    <div v-else-if="errorMessage" class="alert alert-danger">
      {{ errorMessage }}
    </div>

    <!-- Vazio -->
    <div v-else class="text-center py-5" style="color: var(--color-text-muted)">
      <p class="mb-0">Nenhum usuário encontrado.</p>
    </div>
  </div>
</template>

<style scoped>
input {
  border-radius: 20px;
  width: 100%;
  padding: 8px;
  outline: none;
  border: 1px solid var(--color-text-muted);
}

input:focus {
  border: 1px solid var(--color-primary);
}

.skeleton_user {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
}
.skeleton_avatar {
  width: 44px;
  height: 44px;
  background: var(--color-border);
  animation: shimmer 1.2s infinite;
}
.skeleton_username {
  height: 12px;
  width: 40%;
  background: var(--color-border);
  animation: shimmer 1.2s infinite;
}
.skeleton_name {
  height: 12px;
  width: 25%;
  background: var(--color-border);
  animation: shimmer 1.2s infinite;
}

.user {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  cursor: pointer;
}

.seguindo_btn {
  border: 1px solid var(--color-border);
  color: var(--color-text);
  min-width: 90px;
}

.seguir_btn {
  background: var(--color-primary);
  color: #fff;
  min-width: 90px;
}

@keyframes shimmer {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
  100% {
    opacity: 1;
  }
}
</style>
