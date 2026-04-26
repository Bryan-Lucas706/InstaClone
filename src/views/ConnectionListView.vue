<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth.js";
import api from "@/services/api.js";
import Avatar from "@/components/ui/Avatar.vue";
import Spinner from "@/components/ui/Spinner.vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// ── Estado local ─────────────────────────────────────────
const users = ref([]);
const isLoading = ref(false);
const isLoadingMore = ref(false);
const currentPage = ref(1);
const hasMore = ref(false);
const loadingFollow = ref({});

// ── Tipo da lista: seguidores ou seguindo ─────────────────
const type = computed(() => route.params.type);

const title = computed(() =>
  type.value === "followers" ? "Followers" : "Following",
);

// Username do perfil sendo visualizado
const targetUsername = computed(
  () => route.query.user ?? authStore.user?.username,
);

// Redireciona se type for inválido
if (!["followers", "following"].includes(route.params.type)) {
  router.replace("/profile");
}

onMounted(async () => {
  // Busca o id do usuário alvo pelo username
  try {
    const { data } = await api.get(`/users/${targetUsername.value}`);
    await fetchList(data.id, 1);
  } catch {
    router.replace("/profile");
  }
});

let targetUserId = null;

async function fetchList(userId, page) {
  targetUserId = userId;
  if (page === 1) isLoading.value = true;
  else isLoadingMore.value = true;

  try {
    const endpoint =
      type.value === "followers"
        ? `/users/${userId}/followers`
        : `/users/${userId}/following`;

    const { data } = await api.get(endpoint, { params: { page } });

    // Busca estado de seguir para cada usuário
    const withFollowState = await Promise.all(
      data.data
        .filter((u) => u.id !== authStore.user?.id)
        .map(async (u) => {
          try {
            const res = await api.get(`/users/${u.id}/is-following`);
            return { ...u, isFollowing: res.data.is_following };
          } catch {
            return { ...u, isFollowing: false };
          }
        }),
    );

    if (page === 1) users.value = withFollowState;
    else users.value.push(...withFollowState);

    currentPage.value = page;
    hasMore.value = !!data.next_page_url;
  } finally {
    isLoading.value = false;
    isLoadingMore.value = false;
  }
}

async function toggleFollow(user) {
  loadingFollow.value[user.id] = true;
  const wasFollowing = user.isFollowing;
  user.isFollowing = !wasFollowing;

  try {
    if (wasFollowing) {
      await api.delete(`/users/${user.id}/follow`);
    } else {
      await api.post(`/users/${user.id}/follow`);
    }
  } catch {
    user.isFollowing = wasFollowing;
  } finally {
    loadingFollow.value[user.id] = false;
  }
}

function goBack() {
  const query = route.query.user ? `?user=${route.query.user}` : "";
  router.push(`/profile${query}`);
}
</script>

<template>
  <div class="container py-4" style="max-width: 614px">
    <!-- Header -->
    <div class="d-flex align-items-center gap-3 mb-4">
      <button
        class="btn btn-link p-0"
        style="color: var(--color-text)"
        aria-label="Voltar"
        @click="goBack"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          style="width: 24px; height: 24px"
        >
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
      </button>
      <h1 class="mb-0 fw-semibold" style="font-size: 16px">{{ title }}</h1>
    </div>

    <!-- Skeleton -->
    <template v-if="isLoading">
      <div
        v-for="n in 5"
        :key="n"
        class="d-flex align-items-center gap-3 p-3 mb-2 rounded"
        style="
          background: var(--color-surface);
          border: 1px solid var(--color-border);
        "
      >
        <div
          class="rounded-circle"
          style="
            width: 44px;
            height: 44px;
            background: var(--color-border);
            flex-shrink: 0;
          "
        />
        <div class="d-flex flex-column gap-2 flex-grow-1">
          <div
            class="rounded"
            style="height: 12px; width: 40%; background: var(--color-border)"
          />
          <div
            class="rounded"
            style="height: 12px; width: 25%; background: var(--color-border)"
          />
        </div>
      </div>
    </template>

    <!-- Lista -->
    <template v-else-if="users.length > 0">
      <div
        v-for="user in users"
        :key="user.id"
        class="d-flex align-items-center gap-3 p-3 mb-2 rounded"
        style="
          background: var(--color-surface);
          border: 1px solid var(--color-border);
        "
      >
        <RouterLink
          :to="
            user.username === authStore.user?.username
              ? '/profile'
              : `/profile?user=${user.username}`
          "
          class="d-flex align-items-center gap-3 flex-grow-1 overflow-hidden"
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
        </RouterLink>

        <!-- Botão seguir — oculto para o próprio usuário -->
        <button
          v-if="user.id !== authStore.user?.id"
          class="btn btn-sm flex-shrink-0"
          :style="
            user.isFollowing
              ? 'border: 1px solid var(--color-border); color: var(--color-text); min-width: 90px;'
              : 'background: var(--color-primary); color: #fff; min-width: 90px;'
          "
          :disabled="loadingFollow[user.id]"
          @click="toggleFollow(user)"
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
          @click="fetchList(targetUserId, currentPage + 1)"
        >
          <Spinner v-if="isLoadingMore" size="sm" class="me-2" />
          {{ isLoadingMore ? "Carregando..." : "Carregar mais" }}
        </button>
      </div>
    </template>

    <!-- Vazio -->
    <div v-else class="text-center py-5" style="color: var(--color-text-muted)">
      <p class="mb-0">
        {{
          type === "followers"
            ? "Nenhum seguidor ainda."
            : "Não está seguindo ninguém."
        }}
      </p>
    </div>
  </div>
</template>
