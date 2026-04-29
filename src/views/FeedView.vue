<script setup>
import { onMounted, ref } from "vue";
import { useFeedStore } from "@/stores/feed.js";
import PostCard from "@/components/PostCard.vue";
import Spinner from "@/components/ui/Spinner.vue";
import FeedSuggestions from "@/components/FeedSuggestions.vue";

const feedStore = useFeedStore();
const isLoadingMore = ref(false);

onMounted(async () => {
  try {
    await feedStore.fetchFeed();
  } catch {
    // Erro de rede — feed permanece vazio, usuário vê mensagem
  }
});

async function loadMore() {
  isLoadingMore.value = true;
  try {
    await feedStore.loadMoreFeed();
  } catch {
    // Silencioso — botão permanece para nova tentativa
  } finally {
    isLoadingMore.value = false;
  }
}
</script>

<template>
  <div class="feed-layout">
    <div class="feed-layout__main">
      <!-- Skeleton loader — apenas no carregamento inicial -->
      <template v-if="feedStore.isLoading && feedStore.feedPosts.length === 0">
        <div v-for="n in 3" :key="n" class="skeleton-card">
          <div class="d-flex align-items-center gap-2 p-3">
            <div
              class="skeleton rounded-circle"
              style="width: 44px; height: 44px; flex-shrink: 0"
            />
            <div class="d-flex flex-column gap-2 flex-grow-1">
              <div
                class="skeleton"
                style="height: 12px; width: 40%; border-radius: 4px"
              />
              <div
                class="skeleton"
                style="height: 12px; width: 25%; border-radius: 4px"
              />
            </div>
          </div>
          <div class="skeleton" style="width: 100%; aspect-ratio: 1/1" />
        </div>
      </template>
      <!-- Lista de posts -->
      <template v-else-if="feedStore.feedPosts.length > 0">
        <PostCard
          v-for="post in feedStore.feedPosts"
          :key="post.id"
          :post="post"
        />
        <!-- Carregar mais -->
        <div
          v-if="feedStore.nextCursor"
          class="d-flex justify-content-center py-4"
        >
          <button
            class="btn"
            style="color: var(--color-primary); font-weight: 600"
            :disabled="isLoadingMore"
            @click="loadMore"
          >
            <Spinner v-if="isLoadingMore" size="sm" class="me-2" />
            {{ isLoadingMore ? "Carregando..." : "Carregar mais" }}
          </button>
        </div>
      </template>
      <!-- Feed vazio -->
      <div v-else class="feed__empty">
        <div class="feed__empty-icon">📸</div>
        <h2 class="feed__empty-title">Ainda não há posts para exibir.</h2>
        <RouterLink
          to="/create"
          class="btn mt-3"
          style="background: var(--color-primary); color: #fff"
        >
          Criar o primeiro post
        </RouterLink>
      </div>
    </div>
    <div class="feed-layout__aside">
      <FeedSuggestions />
    </div>
  </div>
</template>

<style scoped>
.feed-layout {
  display: flex;
  justify-content: center;
  gap: 100px;
  padding: 24px 0;
}

.feed__empty {
  text-align: center;
  padding: 60px 16px;
  color: var(--color-text-muted);
}

.feed__empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.feed__empty-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 8px;
}

/* Skeleton */
.skeleton-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  margin-bottom: 16px;
  overflow: hidden;
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-border) 25%,
    #f0f0f0 50%,
    var(--color-border) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite;
}

.feed-layout__main {
  margin: auto;
}

.feed-layout__aside {
  display: none;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@media (min-width: 768px) {
  .feed-layout__aside {
    width: 293px;
    display: block;
  }

  .feed-layout__main {
    margin: 0;
  }
}
</style>
