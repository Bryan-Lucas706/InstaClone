<script setup>
import { useRouter } from "vue-router";
import { useProfile } from "@/composables/useProfile.js";
import Avatar from "@/components/ui/Avatar.vue";
import Spinner from "@/components/ui/Spinner.vue";

const router = useRouter();
const {
  profile,
  posts,
  isLoading,
  errorMessage,
  isFollowing,
  followersCount,
  followingCount,
  isLoadingFollow,
  isOwnProfile,
  targetUsername,
  toggleFollow,
} = useProfile();
</script>

<template>
  <div class="container py-4" style="max-width: 935px">
    <!-- Erro -->
    <div v-if="errorMessage" class="alert alert-danger">
      {{ errorMessage }}
    </div>

    <!-- Skeleton -->
    <template v-else-if="isLoading">
      <div class="d-flex align-items-center gap-4 mb-4">
        <div
          class="rounded-circle flex-shrink-0"
          style="width: 80px; height: 80px; background: var(--color-border)"
        />
        <div class="d-flex flex-column gap-2 flex-grow-1">
          <div
            class="rounded"
            style="height: 14px; width: 30%; background: var(--color-border)"
          />
          <div
            class="rounded"
            style="height: 12px; width: 50%; background: var(--color-border)"
          />
        </div>
      </div>
    </template>

    <!-- Perfil carregado -->
    <template v-else-if="profile">
      <!-- ── Header do perfil ── -->
      <div class="d-flex align-items-center gap-4 mt-2 mb-4">
        <Avatar
          :src="profile.avatar_url"
          :alt="profile.username"
          style="width: 150px; height: 150px"
        />

        <div class="flex-grow-1">
          <!-- Username -->
          <div class="d-flex align-items-center gap-3 flex-wrap mb-2">
            <h1 class="mb-0 fw-bold" style="font-size: 24px">
              {{ profile.username }}
            </h1>

            <!-- Nome -->
          </div>
          <p class="mb-0 fw-semibold" style="font-size: 14px">
            {{ profile.name }}
          </p>

          <!-- Contadores -->
          <div class="d-flex gap-4 mb-2">
            <span style="font-size: 14px">
              <strong>{{ posts.length }}</strong> posts
            </span>
            <RouterLink
              :to="
                isOwnProfile
                  ? '/profile/list/followers'
                  : `/profile/list/followers?user=${targetUsername}`
              "
            >
              <strong>{{ followersCount }}</strong> seguidores
            </RouterLink>
            <RouterLink
              :to="
                isOwnProfile
                  ? '/profile/list/following'
                  : `/profile/list/following?user=${targetUsername}`
              "
            >
              <strong>{{ followingCount }}</strong> seguindo
            </RouterLink>
          </div>

          <!-- bio -->
          <p
            v-if="profile.bio"
            class="mb-0"
            style="font-size: 14px; white-space: pre-line"
          >
            {{ profile.bio }}
          </p>
        </div>
      </div>
      <!-- Botão editar (perfil próprio) -->
      <button
        v-if="isOwnProfile"
        class="editProfile fw-semibold"
        @click="router.push('/profile/edit')"
      >
        Editar perfil
      </button>

      <!-- Botão seguir/seguindo (perfil alheio) -->
      <button
        v-else
        :class="isFollowing ? 'seguindo_btn' : 'seguir_btn'"
        :disabled="isLoadingFollow"
        @click="toggleFollow"
      >
        <Spinner v-if="isLoadingFollow" size="sm" />
        <span>{{ isFollowing ? "Seguindo" : "Seguir" }}</span>
      </button>
      <!-- ── Grid de posts ── -->
      <hr class="mb-3" />

      <div v-if="posts.length > 0" class="post-grid">
        <div
          v-for="post in posts"
          :key="post.id"
          class="post-grid__item"
          @click="router.push(`/posts/${post.id}`)"
        >
          <img
            :src="post.image_url"
            :alt="`Post de ${profile.username}`"
            loading="lazy"
          />
        </div>
      </div>

      <!-- Grid vazio -->
      <div
        v-else
        class="text-center py-5"
        style="color: var(--color-text-muted)"
      >
        <p class="mb-0">Nenhum post ainda.</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.editProfile {
  padding: 10px;
  width: 30%;
  border: none;
  border-radius: 10px;
}

.seguindo_btn {
  width: 60%;
  padding: 10px;
  border: none;
  color: var(--color-text);
  border-radius: 10px;
}

.seguir_btn {
  width: 60%;
  border: none;
  padding: 10px;
  background: var(--color-primary);
  border-radius: 10px;
  color: #fff;
}
.post-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 1fr;
  gap: 5px;
}

.post-grid__item {
  overflow: hidden;
  cursor: pointer;
}

.post-grid__item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  aspect-ratio: 3 / 4;
  transition: opacity var(--transition-fast);
}

.post-grid__item:hover img {
  opacity: 0.85;
}
</style>
