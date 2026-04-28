<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import api from '@/services/api.js'
import Avatar from '@/components/ui/Avatar.vue'
import Spinner from '@/components/ui/Spinner.vue'

const router = useRouter()
const authStore = useAuthStore()

const suggestions = ref([])
const isLoading = ref(false)
const loadingFollow = ref({})

onMounted(async () => {
  isLoading.value = true
  try {
    const { data } = await api.get('/users/suggestions')
    const filtered = data.data.filter((u) => u.id !== authStore.user?.id)

    suggestions.value = await Promise.all(
      filtered.slice(0, 5).map(async (u) => {
        try {
          const res = await api.get(`/users/${u.id}/is-following`)
          return { ...u, isFollowing: res.data.is_following }
        } catch {
          return { ...u, isFollowing: false }
        }
      })
    )
  } catch {
    // Silencioso — sugestões não são críticas
  } finally {
    isLoading.value = false
  }
})

async function toggleFollow(user) {
  loadingFollow.value[user.id] = true
  const wasFollowing = user.isFollowing 
  user.isFollowing = !wasFollowing 

  try {
    if (wasFollowing) {
      await api.delete(`/users/${user.id}/follow`)
    } else {
      await api.post(`/users/${user.id}/follow`)
    }
  } catch {
    user.isFollowing = wasFollowing
  } finally {
    loadingFollow.value[user.id] = false
  }
}

function goToProfile(user) {
  if (user.username === authStore.user?.username) {
    router.push('/profile')
  } else {
    router.push(`/profile?user=${user.username}`)
  }
}
</script>

<template>
  <aside class="suggestions">

    <!-- Usuário logado -->
    <div class="suggestions__me d-flex align-items-center gap-3 mb-4">
      <Avatar
        :src="authStore.user?.avatar_url"
        :alt="authStore.user?.username"
        size="md"
      />
      <div class="overflow-hidden">
        <p class="suggestions__me-username text-ellipsis">
          {{ authStore.user?.username }}
        </p>
        <p class="suggestions__me-name text-ellipsis">
          {{ authStore.user?.name }}
        </p>
      </div>
    </div>

    <!-- Header sugestões -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <span class="suggestions__title">Sugestões para você</span>
      <RouterLink to="/discover" class="suggestions__see-all">
        Ver tudo
      </RouterLink>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="d-flex justify-content-center py-3">
      <Spinner size="sm" />
    </div>

    <!-- Lista -->
    <div v-else class="d-flex flex-column gap-3">
      <div
        v-for="user in suggestions"
        :key="user.id"
        class="d-flex align-items-center gap-2"
      >
        <!-- Avatar + info -->
        <div
          class="d-flex align-items-center gap-2 flex-grow-1 overflow-hidden"
          role="button"
          @click="goToProfile(user)"
        >
          <Avatar
            :src="user.avatar_url"
            :alt="user.username"
            size="md"
          />
          <div class="overflow-hidden">
            <p class="suggestions__username text-ellipsis">
              {{ user.username }}
            </p>
            <p class="suggestions__hint text-ellipsis">
              Sugerido para você
            </p>
          </div>
        </div>

        <!-- Botão seguir -->
        <button
          class="suggestions__follow-btn"
          :disabled="loadingFollow[user.id]"
          @click="toggleFollow(user)"
        >
          <Spinner v-if="loadingFollow[user.id]" size="sm" />
          <span v-else>{{ user.isFollowing ? 'Seguindo' : 'Seguir' }}</span>
        </button>
      </div>
    </div>

  </aside>
</template>

<style scoped>
.suggestions {
  top: 24px;
  padding: 24px 0;
  width: 100%;
}

.suggestions__me-username {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
  cursor: pointer;
}

.suggestions__me-name {
  font-size: 12px;
  color: var(--color-text-muted);
  margin: 0;
}

.suggestions__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-muted);
}

.suggestions__see-all {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text);
}

.suggestions__username {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
  cursor: pointer;
}

.suggestions__hint {
  font-size: 12px;
  color: var(--color-text-muted);
  margin: 0;
}

.suggestions__follow-btn {
  background: none;
  border: none;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-primary);
  cursor: pointer;
  flex-shrink: 0;
  padding: 0;
}

.suggestions__follow-btn:disabled {
  opacity: 0.5;
}
</style>