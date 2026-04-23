import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/services/api.js";

export const useFeedStore = defineStore("feed", () => {
  // ─── Estado ───────────────────────────────────────────────

  // Estrutura normalizada: dicionário { [id]: post }
  // Escolhemos normalizar em vez de usar array porque:
  // 1. Acesso por id é O(1) — essencial para toggleLike e addComment
  // 2. Evita duplicatas ao fazer loadMore
  // 3. Atualização otimista é mais simples (mutação direta no objeto)
  const postsById = ref({});

  // feedOrder guarda a sequência dos ids para renderização ordenada.
  // Separar ordem dos dados é o padrão de normalização (Redux-style).
  const feedOrder = ref([]);

  // cursor para paginação infinita — null significa sem mais páginas
  const nextCursor = ref(null);

  const isLoading = ref(false);

  // ─── Getters ──────────────────────────────────────────────

  // getPostById: acesso direto por id — O(1)
  function getPostById(id) {
    return postsById.value[id] ?? null;
  }

  // feedPosts: array ordenado para o v-for do FeedView
  const feedPosts = computed(
    () => feedOrder.value.map((id) => postsById.value[id]).filter(Boolean), // remove ids órfãos caso um post seja deletado
  );

  // ─── Helpers privados ─────────────────────────────────────

  // Normaliza um array de posts recebido da API
  // inserindo cada um no dicionário postsById.
  function _normalizePosts(posts) {
    posts.forEach((post) => {
      postsById.value[post.id] = post;
    });
  }

  // ─── Ações públicas ───────────────────────────────────────

  /**
   * fetchFeed() — carrega a primeira página do feed.
   * Reseta feedOrder para evitar duplicatas ao recarregar.
   */
  async function fetchFeed() {
    isLoading.value = true;
    try {
      const { data } = await api.get("/feed");
      // Reseta estado antes de popular — evita posts duplicados
      postsById.value = {};
      feedOrder.value = [];

      _normalizePosts(data.posts);
      feedOrder.value = data.posts.map((p) => p.id);
      nextCursor.value = data.next_cursor ?? null;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ?? "Erro ao carregar o feed.",
      );
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * loadMoreFeed() — carrega a próxima página acumulando posts.
   * Usa cursor em vez de page number para evitar posts duplicados
   * quando novos itens são inseridos entre requisições.
   */
  async function loadMoreFeed() {
    if (!nextCursor.value || isLoading.value) return;

    isLoading.value = true;
    try {
      const { data } = await api.get("/feed", {
        params: { cursor: nextCursor.value },
      });

      _normalizePosts(data.posts);
      // Acumula ids no final da ordem existente
      feedOrder.value.push(...data.posts.map((p) => p.id));
      nextCursor.value = data.next_cursor ?? null;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ?? "Erro ao carregar mais posts.",
      );
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * toggleLike() — curtir/descurtir com atualização otimista.
   * "Otimista": atualiza a UI imediatamente sem esperar a API,
   * revertendo apenas se a requisição falhar.
   * Isso elimina o delay visual que prejudica a experiência.
   */
  async function toggleLike(postId) {
    const post = postsById.value[postId];
    if (!post) return;

    // Salva estado anterior para reverter em caso de erro
    const wasLiked = post.isLiked;
    const previousCount = post.likesCount;

    // Atualização otimista imediata
    post.isLiked = !wasLiked;
    post.likesCount = wasLiked ? previousCount - 1 : previousCount + 1;

    try {
      if (!wasLiked) {
        await api.post(`/posts/${postId}/like`);
      } else {
        await api.delete(`/posts/${postId}/unlike`);
      }
    } catch (error) {
      // Reverte o estado otimista em caso de falha
      post.isLiked = wasLiked;
      post.likesCount = previousCount;
      throw new Error(
        error.response?.data?.message ?? "Erro ao processar curtida.",
      );
    }
  }

  // Insere o comentário retornado pela API diretamente no post
  async function addComment(postId, text) {
    try {
      const { data } = await api.post(`/posts/${postId}/comments`, { text });
      const post = postsById.value[postId];
      if (post) {
        if (!Array.isArray(post.comments)) post.comments = [];
        post.comments.push(data);
        post.commentsCount = (post.commentsCount ?? 0) + 1;
      }
      return data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ?? "Erro ao adicionar comentário.",
      );
    }
  }

  /**
   * createPost() — envia novo post com FormData (multipart).
   * FormData é necessário porque enviamos arquivo (imagem) +
   * texto (caption) na mesma requisição.
   * Insere o post no início do feed ao ter sucesso.
   */
  async function createPost(formData) {
    try {
      const { data } = await api.post("/posts", formData, {
        // Sobrescreve o Content-Type padrão (application/json)
        // para multipart/form-data — o browser define o boundary
        // automaticamente quando passamos FormData com undefined
        headers: { "Content-Type": undefined },
      });
      postsById.value[data.id] = data;
      feedOrder.value.unshift(data.id);
      return data;
    } catch (error) {
      throw new Error(error.response?.data?.message ?? "Erro ao criar post.");
    }
  }

  /**
   * removePost() — remove post do estado local.
   * Chamado após DELETE /posts/:id bem-sucedido na view.
   */
  function removePost(postId) {
    delete postsById.value[postId];
    feedOrder.value = feedOrder.value.filter((id) => id !== postId);
  }

  return {
    // Estado
    postsById,
    feedOrder,
    nextCursor,
    isLoading,
    // Getters
    feedPosts,
    getPostById,
    // Ações
    fetchFeed,
    loadMoreFeed,
    toggleLike,
    addComment,
    createPost,
    removePost,
  };
});
