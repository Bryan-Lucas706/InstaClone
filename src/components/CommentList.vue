<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth.js'
import { timeAgo } from '@/utils/date.js'
import Avatar from '@/components/ui/Avatar.vue'
import api from '@/services/api.js'

const props = defineProps({
  comments: {
    type: Array,
    required: true,
  },
  hasMore: {
    type: Boolean,
    default: false,
  },
  isLoadingMore: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['load-more', 'comment-deleted'])

const authStore = useAuthStore()
const deletingId = ref(null)

async function deleteComment(commentId) {
  deletingId.value = commentId
  try {
    await api.delete(`/comments/${commentId}`)
    emit('comment-deleted', commentId)
  } catch {
    // Silencioso — comentário permanece na lista
  } finally {
    deletingId.value = null
  }
}
</script>

<template>
  <div>
    <!-- Lista de comentários -->
    <div
      v-for="comment in comments"
      :key="comment.id"
      class="d-flex align-items-start gap-2 px-3 py-2"
    >
      <Avatar
        :src="comment.user?.avatar_url"
        :alt="comment.user?.username"
        size="sm"
      />

      <div class="flex-grow-1">
        <span class="fw-semibold me-1" style="font-size: 14px;">
          {{ comment.user?.username }}
        </span>
        <span style="font-size: 14px;">{{ comment.body }}</span>
        <div class="mt-1" style="font-size: 11px; color: var(--color-text-muted);">
          {{ timeAgo(comment.created_at) }}
        </div>
      </div>

      <!-- Botão deletar — visível apenas para o autor -->
      <button
        v-if="comment.user_id === authStore.user?.id"
        class="btn btn-link p-0 flex-shrink-0"
        style="font-size: 12px; color: var(--color-text-muted);"
        :disabled="deletingId === comment.id"
        aria-label="Deletar comentário"
        @click="deleteComment(comment.id)"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          style="width: 16px; height: 16px;"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Carregar mais comentários -->
    <div v-if="hasMore" class="px-3 pb-2">
      <button
        class="btn btn-link p-0"
        style="font-size: 14px; color: var(--color-text-muted);"
        :disabled="isLoadingMore"
        @click="emit('load-more')"
      >
        {{ isLoadingMore ? 'Carregando...' : 'Ver mais comentários' }}
      </button>
    </div>

    <!-- Vazio -->
    <div
      v-if="comments.length === 0"
      class="px-3 py-2"
      style="font-size: 14px; color: var(--color-text-muted);"
    >
      Nenhum comentário ainda. Seja o primeiro!
    </div>
  </div>
</template>