<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth.js";
import { useFeedStore } from "@/stores/feed.js";
import { timeAgo } from "@/utils/date.js";
import { formatCount } from "@/utils/format.js";
import api from "@/services/api.js";
import Avatar from "@/components/ui/Avatar.vue";
import Spinner from "@/components/ui/Spinner.vue";
import ConfirmModal from "@/components/ui/ConfirmModal.vue";
import CommentInput from "@/components/CommentInput.vue";
import CommentList from "@/components/CommentList.vue";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const feedStore = useFeedStore();

const post = ref(null);
const comments = ref([]);
const isLoading = ref(false);
const isLiking = ref(false);
const showDeleteModal = ref(false);
const isDeletingPost = ref(false);

const commentsPage = ref(1);
const hasMoreComments = ref(false);
const isLoadingMoreComments = ref(false);

onMounted(async () => {
  await fetchPost();
});

async function fetchPost() {
  isLoading.value = true;
  try {
    const [postRes, commentsRes] = await Promise.all([
      api.get(`/posts/${route.params.postId}`),
      api.get(`/posts/${route.params.postId}/comments`, {
        params: { page: 1 },
      }),
    ]);

    post.value = {
      ...postRes.data,
      liked_by_me: postRes.data.liked_by_me ?? false,
      likes_count: postRes.data.likes_count ?? 0,
    };

    comments.value = commentsRes.data.data;
    hasMoreComments.value = !!commentsRes.data.next_page_url;
    commentsPage.value = 1;
  } catch {
    router.replace("/feed");
  } finally {
    isLoading.value = false;
  }
}

async function loadMoreComments() {
  isLoadingMoreComments.value = true;
  try {
    const nextPage = commentsPage.value + 1;
    const { data } = await api.get(`/posts/${route.params.postId}/comments`, {
      params: { page: nextPage },
    });
    comments.value.push(...data.data);
    hasMoreComments.value = !!data.next_page_url;
    commentsPage.value = nextPage;
  } finally {
    isLoadingMoreComments.value = false;
  }
}

async function handleLike() {
  if (!post.value || isLiking.value) return;
  isLiking.value = true;

  const wasLiked = post.value.liked_by_me;
  post.value.liked_by_me = !wasLiked;
  post.value.likes_count = wasLiked
    ? post.value.likes_count - 1
    : post.value.likes_count + 1;

  try {
    if (wasLiked) {
      await api.delete(`/posts/${post.value.id}/like`);
    } else {
      await api.post(`/posts/${post.value.id}/like`);
    }
    // Sincroniza com o feed store se o post estiver lá
    feedStore.toggleLike(post.value.id);
  } catch {
    post.value.liked_by_me = wasLiked;
    post.value.likes_count = wasLiked
      ? post.value.likes_count + 1
      : post.value.likes_count - 1;
  } finally {
    isLiking.value = false;
  }
}

async function handleCommentAdded(body) {
  try {
    const { data } = await api.post(`/posts/${route.params.postId}/comments`, {
      body,
    });
    comments.value.unshift(data);
  } catch {
    // Silencioso — input permanece para reenvio
  }
}

function handleCommentDeleted(commentId) {
  comments.value = comments.value.filter((comment) => comment.id !== commentId);
}

async function handleDeletePost() {
  isDeletingPost.value = true;
  try {
    await api.delete(`/posts/${post.value.id}`);
    feedStore.removePost(post.value.id);
    router.replace(`/profile`);
  } catch {
    showDeleteModal.value = false;
  } finally {
    isDeletingPost.value = false;
  }
}

const isOwnPost = () => post.value?.user?.id === authStore.user?.id;
</script>

<template>
  <div>
    <!-- Loading -->
    <div
      v-if="isLoading"
      class="d-flex justify-content-center align-items-center"
      style="min-height: 60vh"
    >
      <Spinner size="lg" />
    </div>

    <template v-else-if="post">
      <!-- ── Layout Mobile ── -->
      <div class="d-md-none">
        <!-- Header -->
        <div
          class="d-flex align-items-center gap-2 p-3"
          style="border-bottom: 1px solid var(--color-border)"
        >
          <button
            class="btn btn-link p-0 me-1"
            style="color: var(--color-text)"
            aria-label="Voltar"
            @click="router.back()"
          >
            <i class="fa-solid fa-arrow-left"></i>
          </button>
          <Avatar
            :src="post.user?.avatar_url"
            :alt="post.user?.username"
            size="md"
          />
          <RouterLink
            :to="`/profile?user=${post.user?.username}`"
            class="fw-semibold"
          >
            {{ post.user?.username }}
          </RouterLink>

          <!-- Deletar post -->
          <button
            v-if="isOwnPost()"
            class="btn btn-link p-0 ms-auto"
            style="color: #ed4956"
            aria-label="Deletar post"
            @click="showDeleteModal = true"
          >
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>

        <!-- Imagem -->
        <img
          :src="post.image_url"
          :alt="`Post de ${post.user?.username}`"
          class="w-100"
          style="aspect-ratio: 3 / 4; object-fit: cover"
        />

        <!-- Actions -->
        <div class="d-flex align-items-center gap-2 px-3 py-2">
          <button
            class="like-btn fs-5"
            :aria-label="post.liked_by_me ? 'Descurtir' : 'Curtir'"
            @click="handleLike"
          >
            <i
              v-if="post.liked_by_me"
              class="fa-solid fa-heart"
              style="color: #eb3443"
            ></i>
            <i v-else class="fa-regular fa-heart"></i>
          </button>
          <span class="fw-semibold">
            {{ formatCount(post.likes_count) }} curtidas
          </span>
        </div>

        <!-- Legenda -->
        <div class="px-3 py-2" v-if="post.caption">
          <span class="fw-semibold me-1">{{ post.user?.username }}</span>
          <span>{{ post.caption }}</span>
        </div>

        <!-- Data -->
        <time
          class="d-block px-3 pb-2"
          style="
            font-size: 11px;
            color: var(--color-text-muted);
          "
        >
          {{ timeAgo(post.created_at) }}
        </time>

        <!-- Comentários -->
        <CommentList
          :comments="comments"
          :has-more="hasMoreComments"
          :is-loading-more="isLoadingMoreComments"
          @load-more="loadMoreComments"
          @comment-deleted="handleCommentDeleted"
        />

        <!-- Input comentário -->
        <CommentInput @comment-added="handleCommentAdded" />
      </div>

      <!-- ── Layout Desktop ── -->
      <div class="d-none d-md-flex desktop-layout">
        <!-- Imagem -->
        <div class="desktop-layout__image">
          <img
            :src="post.image_url"
            :alt="`Post de ${post.user?.username}`"
            style="
              width: 100%;
              height: 100%;
              object-fit: cover;
              aspect-ratio: 3 / 4;
            "
          />
        </div>

        <!-- Painel direito -->
        <div class="desktop-layout__panel d-flex flex-column">
          <!-- Header -->
          <div
            class="d-flex align-items-center gap-2 p-3 flex-shrink-0"
            style="border-bottom: 1px solid var(--color-border)"
          >
            <Avatar
              :src="post.user?.avatar_url"
              :alt="post.user?.username"
              size="md"
            />
            <RouterLink
              :to="`/profile?user=${post.user?.username}`"
              class="fw-semibold"
              style="width: 100%"
            >
              {{ post.user?.username }}
            </RouterLink>

            <button
              v-if="isOwnPost()"
              class="btn btn-link p-0"
              style="color: #ed4956"
              aria-label="Deletar post"
              @click="showDeleteModal = true"
            >
              <i class="fa-solid fa-trash"></i>
            </button>
            <button
              class="btn btn-link p-0 me-1"
              style="color: var(--color-text)"
              aria-label="Voltar"
              @click="router.back()"
            >
              <i class="fa-solid fa-x"></i>
            </button>
          </div>

          <!-- Legenda -->
          <div
            v-if="post.caption"
            class="p-3 flex-shrink-0"
            style="border-bottom: 1px solid var(--color-border)"
          >
            <span class="fw-semibold me-1">{{ post.user?.username }}</span>
            <span>{{ post.caption }}</span>
            <time
              class="d-block mt-1"
              style="font-size: 11px; color: var(--color-text-muted)"
            >
              {{ timeAgo(post.created_at) }}
            </time>
          </div>

          <!-- Lista de comentários com scroll -->
          <div class="flex-grow-1 overflow-auto">
            <CommentList
              :comments="comments"
              :has-more="hasMoreComments"
              :is-loading-more="isLoadingMoreComments"
              @load-more="loadMoreComments"
              @comment-deleted="handleCommentDeleted"
            />
          </div>

          <!-- Actions + input fixos no bottom -->
          <div
            class="flex-shrink-0"
            style="border-top: 1px solid var(--color-border)"
          >
            <div class="d-flex gap-2 px-3 py-2">
              <button
                class="like-btn fs-5"
                :aria-label="post.liked_by_me ? 'Descurtir' : 'Curtir'"
                @click="handleLike"
              >
                <i
                  v-if="post.liked_by_me"
                  class="fa-solid fa-heart"
                  style="color: #eb3443"
                ></i>
                <i v-else class="fa-regular fa-heart"></i>
              </button>
              <span class="fw-semibold" style="font-size: 14px">
                {{ formatCount(post.likes_count) }} curtidas
              </span>
            </div>
            <CommentInput @comment-added="handleCommentAdded" />
          </div>
        </div>
      </div>
    </template>

    <!-- Modal de confirmação para deletar post -->
    <ConfirmModal
      v-if="showDeleteModal"
      title="Excluir post"
      message="Tem certeza que deseja excluir este post? Essa ação não pode ser desfeita."
      confirm-label="Excluir"
      cancel-label="Cancelar"
      @confirm="handleDeletePost"
      @cancel="showDeleteModal = false"
    />
  </div>
</template>

<style scoped>
/* Layout desktop: imagem à esquerda, painel à direita */
.like-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: 0.3s;
}

.like-btn:hover {
  transform: scale(1.1);
}
.desktop-layout {
  height: calc(95vh - var(--header-height));
  max-width: 935px;
  margin: 30px auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.desktop-layout__image {
  display: flex;
  align-items: center;
  border-radius: var(--radius-md) 0 0 var(--radius-md);
  flex: 1;
  background: #000;
}

.desktop-layout__panel {
  width: 40%;
  flex-shrink: 0;
  border-left: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
}
</style>
