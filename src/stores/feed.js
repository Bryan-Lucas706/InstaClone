import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { MOCK_POSTS } from "@/data/mockData.js";
import { useAuthStore } from "@/stores/auth.js";

const STORAGE_KEY = "instaclone_posts";

export const useFeedStore = defineStore("feed", () => {
  // ─── Estado ───────────────────────────────────────────────
  const posts = ref([]);
  // page e hasMore controlam a paginação do feed
  const page = ref(1);
  const hasMore = ref(true);

  // ─── Computeds ────────────────────────────────────────────
  // Posts ordenados do mais recente para o mais antigo.
  const sortedPosts = computed(() =>
    [...posts.value].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    ),
  );

  // ─── Helpers privados ─────────────────────────────────────

  // Salva o array de posts no localStorage.
  function _persistPosts() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts.value));
  }

  // ─── Ações públicas ───────────────────────────────────────

  /**
   * init() — Carrega os Posts do localStorage.
   * Se não houver Posts salvos, usa MOCK_POSTS como seed.
   * Chamado no onMounted do App.vue.
   */
  function init() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      posts.value = JSON.parse(saved);
    } else {
      posts.value = [...MOCK_POSTS];
      _persistPosts();
    }
  }

  /**
   * getPaginatedFeed() — retorna um slice dos posts ordenados.
   * Paginação client-side: simula o comportamento de uma API paginada.
   */
  function getPaginatedFeed(pageNum = 1, perPage = 5) {
    const start = (pageNum - 1) * perPage;
    const end = start + perPage;
    const items = sortedPosts.value.slice(start, end);
    const more = end < sortedPosts.value.length;
    return { items, hasMore: more };
  }

  // busca um post pelo id.
  function getPostById(id) {
    return posts.value.find((p) => p.id === id) ?? null;
  }

  // filtra por data decrescente os posts de um usuário específico.
  function getPostsByUser(userId) {
    return [...posts.value]
      .filter((p) => p.authorId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // createPost() — cria um novo post e o insere no topo do feed.
  async function createPost(imageBase64, caption, location = "") {
    // Simula upload para deixar o spinner visível
    await _delay(600);

    const authStore = useAuthStore();

    const newPost = {
      id: `post_${Date.now()}`,
      authorId: authStore.currentUserId,
      imageUrl: imageBase64,
      caption,
      location,
      likesCount: 0,
      likedBy: [],
      createdAt: new Date().toISOString(),
      comments: [],
    };

    // unshift insere no inicio do Array, fazendo aparecer como mais recente
    posts.value.unshift(newPost);
    _persistPosts();

    return newPost;
  }

  // remove um post pelo id.
  // A verificação de permissão é feita na view
  function deletePost(id) {
    posts.value = posts.value.filter((p) => p.id !== id);
    _persistPosts();
  }

  // toggleLike() — adiciona ou remove curtida com atualização otimista.
  // otimista: Não precisa de confirmação do servidor para atualizar
  function toggleLike(postId, userId) {
    const post = posts.value.find((p) => p.id === postId);
    if (!post) return;

    // Garante que likedBy existe (posts antigos podem não ter)
    if (!Array.isArray(post.likedBy)) post.likedBy = [];

    const alreadyLiked = post.likedBy.includes(userId);

    if (alreadyLiked) {
      // Tirar curtida
      post.likedBy = post.likedBy.filter((id) => id !== userId);
      post.likesCount = Math.max(0, post.likesCount - 1);
    } else {
      // Curtir
      post.likedBy.push(userId);
      post.likesCount += 1;
    }

    _persistPosts();
  }

  /*
   * isLikedByUser() — função para verificar se um post foi curtido.
   * Usado pelo PostCard e PostDetailView para renderizar o ícone correto.
   */
  function isLikedByUser(postId, userId) {
    const post = posts.value.find((p) => p.id === postId);
    if (!post || !Array.isArray(post.likedBy)) return false;
    return post.likedBy.includes(userId);
  }

  // Busca o username do autor no authStore para evitar duplicar dados
  function addComment(postId, text, userId) {
    const post = posts.value.find((p) => p.id === postId);
    if (!post) return;

    const authStore = useAuthStore();
    const author = authStore.getUserById(userId);

    const newComment = {
      id: `comment_${Date.now()}`,
      userId,
      username: author?.username ?? "usuario", // Fallback caso não encontre o usuário
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };

    if (!Array.isArray(post.comments)) post.comments = [];
    post.comments.push(newComment);
    _persistPosts();

    return newComment;
  }

  // ─── Utilitário interno ───────────────────────────────────
  function _delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  return {
    // Estado
    posts,
    page,
    hasMore,
    // Computeds
    sortedPosts,
    // Ações
    init,
    getPaginatedFeed,
    getPostById,
    getPostsByUser,
    createPost,
    deletePost,
    toggleLike,
    isLikedByUser,
    addComment,
  };
});
