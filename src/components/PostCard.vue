<script setup>
import { ref, computed } from "vue";
import { useFeedStore } from "@/stores/feed.js";
import { timeAgo } from "@/utils/date.js";
import { formatCount } from "@/utils/format.js";
import Avatar from "@/components/ui/Avatar.vue";

const props = defineProps({
  post: {
    type: Object,
    required: true,
  },
});

const feedStore = useFeedStore();

// ── Legenda truncada ──────────────────────────────────────
const CAPTION_LIMIT = 120;
const captionExpanded = ref(false);

const captionText = computed(() => {
  if (!props.post.caption) return "";
  if (captionExpanded.value || props.post.caption.length <= CAPTION_LIMIT) {
    return props.post.caption;
  }
  return props.post.caption.slice(0, CAPTION_LIMIT) + "...";
});

const showCaptionToggle = computed(
  () => props.post.caption?.length > CAPTION_LIMIT,
);

// ── Curtida ───────────────────────────────────────────────
async function handleLike() {
  try {
    await feedStore.toggleLike(props.post.id);
  } catch {
    // Erro já revertido no store — não precisa tratar aqui
  }
}

// ── Comentário inline ─────────────────────────────────────
const commentText = ref("");

async function handleComment() {
  const text = commentText.value.trim();
  if (!text) return;
  try {
    await feedStore.addComment(props.post.id, text);
    commentText.value = "";
  } catch {
    // Campo permanece preenchido para reenvio
  }
}
</script>

<template>
  <article class="post-card">
    <!-- Header: avatar + username -->
    <header class="post-card__header">
      <Avatar
        :src="post.user?.avatar_url"
        :alt="post.user?.username ?? 'usuário'"
        size="md"
      />
      <RouterLink
        :to="`/profile?user=${post.user?.username}`"
        class="post-card__username"
      >
        {{ post.user?.username }}
      </RouterLink>
      <!-- Data -->
      <time class="post-card__date"> • {{ timeAgo(post.created_at) }} </time>
    </header>

    <!-- Imagem do post -->
    <img
      :src="post.image_url"
      :alt="`Post de ${post.user?.username}`"
      class="post-card__image"
      loading="lazy"
    />

    <!-- Actions: curtir -->
    <div class="post-card__actions">
      <button
        class="post-card__like-btn"
        :aria-label="post.isLiked ? 'Descurtir post' : 'Curtir post'"
        @click="handleLike"
      >
        <!-- Coração preenchido (curtido) -->
        <i
          v-if="post.isLiked"
          class="fa-solid fa-heart"
          style="color: #eb3443"
        ></i>
        <!-- Coração vazio (não curtido) -->
        <i v-else class="fa-regular fa-heart"></i>
      </button>

      <span class="post-card__likes-count">
        {{ formatCount(post.likes_count ?? 0) }}
      </span>

      <!-- Link para comentários -->
      <RouterLink :to="`/posts/${post.id}`" class="post-card__comments-link">
        <i class="fa-regular fa-comment"></i>
        {{ formatCount(post.comments_count) }}
      </RouterLink>
    </div>

    <!-- Legenda -->
    <p v-if="post.caption" class="post-card__caption">
      <strong>{{ post.user?.username }}</strong>
      {{ captionText }}
      <button
        v-if="showCaptionToggle"
        class="post-card__caption-toggle"
        @click="captionExpanded = !captionExpanded"
      >
        {{ captionExpanded ? " menos" : " mais" }}
      </button>
    </p>

    <!-- Input inline de comentário -->
    <div class="post-card__comment-form">
      <input
        v-model="commentText"
        type="text"
        class="post-card__comment-input"
        placeholder="Adicione um comentário..."
        :aria-label="`Comentar no post de ${post.user?.username}`"
        @keydown.enter.prevent="handleComment"
      />
      <button
        class="post-card__comment-submit"
        :disabled="!commentText.trim()"
        @click="handleComment"
      >
        Publicar
      </button>
    </div>
  </article>
</template>

<style scoped>
@media (min-width: 480px) {
  .post-card {
    border-radius: var(--radius-md);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
  }
}

.post-card {
  margin-bottom: 24px;
  overflow: hidden;
}

/* ── Header ── */
.post-card__header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
}

.post-card__username {
  font-weight: 600;
}

.post-card__username:hover {
  text-decoration: underline;
}

/* ── Data ── */
.post-card__date {
  display: block;
  font-size: 0.9em;
  color: var(--color-text-muted);
}

/* ── Imagem ── */
.post-card__image {
  width: 100%;
  object-fit: cover;
  display: block;
}

/* ── Actions ── */
.post-card__actions {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 10px 16px 4px;

  & i {
    font-size: 1.5em;
  }
}

.post-card__like-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: transform var(--transition-fast);
}

.post-card__like-btn:hover {
  transform: scale(1.1);
}

.post-card__likes-count {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
}

/* ── Comentários ── */
.post-card__comments-link {
  display: block;
  padding: 2px 16px;
  font-size: 14px;
  color: var(--color-text-muted);
}

.post-card__comments-link:hover {
  color: var(--color-text);
}

/* ── Legenda ── */
.post-card__caption {
  padding: 4px 16px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-text);
}

.post-card__caption strong {
  font-weight: 600;
  margin-right: 4px;
}

.post-card__caption-toggle {
  background: none;
  border: none;
  padding: 0;
  font-size: 14px;
  color: var(--color-text-muted);
  cursor: pointer;
}

/* ── Input de comentário inline ── */
.post-card__comment-form {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-top: 1px solid var(--color-border);
  gap: 8px;
}

.post-card__comment-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  background: transparent;
  color: var(--color-text);
}

.post-card__comment-input::placeholder {
  color: var(--color-text-muted);
}

.post-card__comment-submit {
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-primary);
  cursor: pointer;
  padding: 0;
  opacity: 0.4;
  transition: opacity var(--transition-fast);
}

.post-card__comment-submit:not(:disabled) {
  opacity: 1;
}

/* ── Skeleton ── */
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-border) 25%,
    #f0f0f0 50%,
    var(--color-border) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite;
  border-radius: var(--radius-sm);
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
