import { ref, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth.js";
import api from "@/services/api.js";

export function useProfile() {
  const route = useRoute();
  const authStore = useAuthStore();

  // ── Estado ───────────────────────────────────────────────
  const profile = ref(null);
  const posts = ref([]);
  const isLoading = ref(false);
  const errorMessage = ref("");
  const isFollowing = ref(false);
  const followersCount = ref(0);
  const followingCount = ref(0);
  const isLoadingFollow = ref(false);

  // ── Computeds ────────────────────────────────────────────

  // Username alvo: vem da query ?user= ou é o próprio usuário
  const targetUsername = computed(
    () => route.query.user ?? authStore.user?.username,
  );

  const isOwnProfile = computed(
    () => targetUsername.value === authStore.user?.username,
  );

  // ── Ações ─────────────────────────────────────────────────

  /**
   * fetchAll() — carrega perfil, posts e estado de seguir em paralelo.
   * Promise.all garante que todas as requisições saem juntas,
   * reduzindo o tempo total de carregamento.
   */
  async function fetchAll(username) {
    if (!username) return;
    isLoading.value = true;
    errorMessage.value = "";

    try {
      // Busca perfil primeiro para obter o id
      const { data: profileData } = await api.get(`/users/${username}`);
      profile.value = profileData;

      // Com o id em mãos, busca posts e contadores em paralelo
      const [postsRes, followersRes, followingRes] = await Promise.all([
        api.get(`/users/${profileData.id}/posts`),
        api.get(`/users/${profileData.id}/followers`),
        api.get(`/users/${profileData.id}/following`),
      ]);

      posts.value = postsRes.data.data;
      followersCount.value = followersRes.data.meta.total;
      followingCount.value = followingRes.data.meta.total;
      
      // Verifica estado de seguir apenas se for perfil alheio
      if (!isOwnProfile.value) {
        const { data: followData } = await api.get(
          `/users/${profileData.id}/is-following`,
        );
        isFollowing.value = followData.is_following;
      }
    } catch (error) {
      console.log(error);
      errorMessage.value = "Erro ao carregar perfil.";
    } finally {
      isLoading.value = false;
    }
  }

  // toggleFollow() — segue ou deixa de seguir com atualização otimista.
  async function toggleFollow() {
    if (!profile.value) return;
    isLoadingFollow.value = true;

    const wasFollowing = isFollowing.value;
    // Atualização otimista
    isFollowing.value = !wasFollowing;
    followersCount.value = wasFollowing
      ? followersCount.value - 1
      : followersCount.value + 1;

    try {
      if (wasFollowing) {
        await api.delete(`/users/${profile.value.id}/follow`);
      } else {
        await api.post(`/users/${profile.value.id}/follow`);
      }
    } catch {
      // Reverte em caso de erro
      isFollowing.value = wasFollowing;
      followersCount.value = wasFollowing
        ? followersCount.value + 1
        : followersCount.value - 1;
    } finally {
      isLoadingFollow.value = false;
    }
  }

  // Recarrega ao trocar o ?user= na query
  watch(targetUsername, (username) => fetchAll(username), { immediate: true });

  return {
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
  };
}
