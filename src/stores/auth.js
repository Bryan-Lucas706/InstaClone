import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api, { TOKEN_KEY } from "@/services/api.js";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const token = ref(null);

  const isAuthenticated = computed(() => !!token.value);

  // ─── Helpers privados ─────────────────────────────────────

  // Garante que os dois ficam sempre sincronizados
  function _saveToken(newToken) {
    token.value = newToken;
    localStorage.setItem(TOKEN_KEY, newToken);
  }

  // ─── Ações públicas ───────────────────────────────────────

  // init() — chamado no onMounted do App.vue
  async function init() {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    if (!savedToken) return;

    token.value = savedToken;
    await fetchMe();
  }

  // fetchMe() — busca os dados atuais do usuário logado
  // Se falhar (token inválido/expirado), encerra a sessão
  async function fetchMe() {
    try {
      const { data } = await api.get("/auth/me");
      user.value = data;
    } catch {
      // Token inválido ou expirado — encerra sessão
      logout();
    }
  }

  // login() — entra com email e senha.
  // O backend retorna { access_token, user }.
  async function login(email, password) {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      _saveToken(data.access_token);
      user.value = data.user;
    } catch (error) {
      throw new Error("Erro ao fazer login. Tente novamente.");
    }
  }

  // Shape do body segue o contrato da API.
  async function register(
    name,
    username,
    email,
    password,
    password_confirmation,
  ) {
    try {
      const { data } = await api.post("/auth/register", {
        name,
        username,
        email,
        password,
        password_confirmation,
      });
      _saveToken(data.access_token);
      user.value = data.user;
    } catch (error) {
      // Repassamos o erro inteiro para a view decidir como exibir
      // mensagem geral ou erros inline por campo.
      throw error;
    }
  }

  // logout() — encerra a sessão local e notifica o backend.
  // O POST /auth/logout é feito mesmo se o token já estiver inválido
  async function logout() {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignora erro — o backend pode rejeitar token já expirado.
      // O importante é limpar o estado local independente disso.
    } finally {
      user.value = null;
      token.value = null;
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  // updateProfile() — atualiza o estado local do usuário
  // sincroniza o estado do store com a resposta da API.
  function updateProfile(updatedUser) {
    user.value = { ...user.value, ...updatedUser };
  }

  return {
    user,
    token,
    isAuthenticated,
    // Ações
    init,
    fetchMe,
    login,
    register,
    logout,
    updateProfile,
  };
});
