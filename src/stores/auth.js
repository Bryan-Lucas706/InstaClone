import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { MOCK_USERS } from "@/data/mockData.js";

// Chaves padronizadas para o localStorage.
// Centralizar aqui evita typos espalhados pelo código.
const STORAGE_KEYS = {
  token: "instaclone_token",
  user: "instaclone_user",
  accounts: "instaclone_accounts",
};

export const useAuthStore = defineStore("auth", () => {
  // ─── Estado ───────────────────────────────────────────────
  // user: objeto do usuário logado ou null se não autenticado
  const user = ref(null);
  // token: string mock gerada no login ou null
  const token = ref(null);
  // localAccounts: todas as contas cadastradas na aplicação
  // (usuários mock + qualquer conta criada via register)
  const localAccounts = ref([]);

  // ─── Computeds ────────────────────────────────────────────
  // isAuthenticated: fonte da verdade para guards de rota
  const isAuthenticated = computed(() => !!token.value);
  // currentUserId: atalho usado pelos stores e componentes
  const currentUserId = computed(() => user.value?.id ?? null);

  // ─── Helpers privados ─────────────────────────────────────

  // Persiste accounts no localStorage.
  // Chamado sempre que localAccounts sofre mutação.
  function _persistAccounts() {
    localStorage.setItem(
      STORAGE_KEYS.accounts,
      JSON.stringify(localAccounts.value),
    );
  }

  // Persiste a sessão ativa (user + token).
  function _persistSession() {
    localStorage.setItem(STORAGE_KEYS.token, token.value);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user.value));
  }

  // Limpa a sessão do estado e do localStorage.
  function _clearSession() {
    user.value = null;
    token.value = null;
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.user);
  }

  // ─── Ações públicas ───────────────────────────────────────

  /**
   * init() — hidrata o store a partir do localStorage.
     Chamado uma única vez no onMounted do App.vue.
   * Lógica de seed: se não existir nenhuma conta salva,
     insere os MOCK_USERS como ponto de partida, garantindo
     que a aplicação sempre tenha dados para explorar.
   */
  function init() {
    // Carrega contas salvas ou faz seed com os mocks
    const savedAccounts = localStorage.getItem(STORAGE_KEYS.accounts);
    if (savedAccounts) {
      localAccounts.value = JSON.parse(savedAccounts);
    } else {
      localAccounts.value = [...MOCK_USERS];
      _persistAccounts();
    }

    // Restaura sessão ativa se existir
    const savedToken = localStorage.getItem(STORAGE_KEYS.token);
    const savedUser = localStorage.getItem(STORAGE_KEYS.user);
    if (savedToken && savedUser) {
      token.value = savedToken;
      user.value = JSON.parse(savedUser);
    }
  }

  /**
   * login() — autentica um usuário pelo username e senha.
   * Busca em localAccounts (inclui mocks + cadastrados).
   * Gera token mock baseado em timestamp — único por sessão.
   */
  async function login(username, password) {
    // Simula latência de rede para o loading state da UI funcionar
    await _delay(400);

    const account = localAccounts.value.find(
      (acc) => acc.username === username && acc.password === password,
    );

    if (!account) {
      throw new Error("Usuário ou senha incorretos.");
    }

    // Gera token mock — em produção, viria do backend
    token.value = `mock-token-${Date.now()}`;
    // Salva sem o campo password no estado/localStorage por segurança
    const { password: _omit, ...safeUser } = account;
    user.value = safeUser;

    _persistSession();
  }

  /**
   * register() — cria uma nova conta e faz login automático.
   * Valida unicidade de username antes de criar.
   */
  async function register(name, username, email, password) {
    await _delay(400);

    const usernameExists = localAccounts.value.some(
      (acc) => acc.username === username,
    );
    if (usernameExists) {
      throw new Error("Este nome de usuário já está em uso.");
    }

    const emailExists = localAccounts.value.some((acc) => acc.email === email);
    if (emailExists) {
      throw new Error("Este e-mail já está cadastrado.");
    }

    // Cria novo usuário com shape idêntico aos MOCK_USERS
    const newAccount = {
      id: `user_${Date.now()}`,
      username,
      name,
      email,
      password, // armazenado apenas no mock local
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      bio: "",
      followersCount: 0,
      followingCount: 0,
      following: [],
      followers: [],
    };

    localAccounts.value.push(newAccount);
    _persistAccounts();

    // Login automático após cadastro — sem fricção para o usuário
    await login(username, password);
  }

  // logout() — encerra a sessão completamente.

  function logout() {
    _clearSession();
  }

  /**
   * updateProfile() — atualiza dados do usuário logado.
   * Sincroniza tanto o estado reativo quanto o localAccounts
   */
  async function updateProfile(data) {
    await _delay(300);

    // Valida novo username apenas se foi alterado
    if (data.username && data.username !== user.value.username) {
      const taken = localAccounts.value.some(
        (acc) => acc.username === data.username && acc.id !== user.value.id,
      );
      if (taken) {
        throw new Error("Este nome de usuário já está em uso.");
      }
    }

    // Atualiza o usuário no array de contas
    const accountIndex = localAccounts.value.findIndex(
      (acc) => acc.id === user.value.id,
    );
    if (accountIndex !== -1) {
      localAccounts.value[accountIndex] = {
        ...localAccounts.value[accountIndex],
        ...data,
      };
      _persistAccounts();
    }

    // Atualiza o usuário da sessão ativa
    user.value = { ...user.value, ...data };
    _persistSession();
  }

  // getUserById() — Usado pelo feed para montar dados do autor de cada post.
  function getUserById(id) {
    return localAccounts.value.find((acc) => acc.id === id) ?? null;
  }

  // getUserByUsername() —  Usado pelas views de perfil.
  function getUserByUsername(username) {
    return localAccounts.value.find((acc) => acc.username === username) ?? null;
  }

  /* 
  toggleFollow() — alterna o estado de seguir/não seguir.
  Atualiza followersCount do alvo e followingCount do usuário logado.
   */
  function toggleFollow(targetUserId) {
    const currentId = user.value?.id;
    if (!currentId || currentId === targetUserId) return;

    const targetIndex = localAccounts.value.findIndex(
      (acc) => acc.id === targetUserId,
    );
    const currentIndex = localAccounts.value.findIndex(
      (acc) => acc.id === currentId,
    );
    if (targetIndex === -1 || currentIndex === -1) return;

    const target = localAccounts.value[targetIndex];
    const current = localAccounts.value[currentIndex];

    const isFollowing = current.following?.includes(targetUserId);

    if (isFollowing) {
      // Deixar de seguir
      target.followers = target.followers.filter((id) => id !== currentId);
      target.followersCount = Math.max(0, target.followersCount - 1);
      current.following = current.following.filter((id) => id !== targetUserId);
      current.followingCount = Math.max(0, current.followingCount - 1);
    } else {
      // Seguir
      target.followers = [...(target.followers ?? []), currentId];
      target.followersCount = (target.followersCount ?? 0) + 1;
      current.following = [...(current.following ?? []), targetUserId];
      current.followingCount = (current.followingCount ?? 0) + 1;
    }

    // Reflete mudança no usuário da sessão ativa
    user.value = { ...user.value, ...current };

    _persistAccounts();
    _persistSession();
  }

  // ─── Utilitário interno ───────────────────────────────────

  // Simula latência de rede para que estados de loading
  // sejam visíveis durante o desenvolvimento local
  function _delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  return {
    // Estado
    user,
    token,
    localAccounts,
    // Computeds
    isAuthenticated,
    currentUserId,
    // Ações
    init,
    login,
    register,
    logout,
    updateProfile,
    getUserById,
    getUserByUsername,
    toggleFollow,
  };
});
