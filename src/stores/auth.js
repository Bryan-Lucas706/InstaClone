import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api, { TOKEN_KEY } from '@/services/api.js'

export const useAuthStore = defineStore('auth', () => {
  // ─── Estado ───────────────────────────────────────────────
  const user = ref(null)
  const token = ref(null)

  // ─── Computeds ────────────────────────────────────────────
  const isAuthenticated = computed(() => !!token.value)

  // ─── Helpers privados ─────────────────────────────────────

  // Garante que os dois ficam sempre sincronizados.
  function _saveToken(newToken) {
    token.value = newToken
    localStorage.setItem(TOKEN_KEY, newToken)
  }

  // ─── Ações públicas ───────────────────────────────────────

  /**
   * init() — chamado no onMounted do App.vue.
   * Se existir token salvo, tenta restaurar a sessão
   * consultando o backend. Se o token estiver expirado,
   * o interceptor 401 do api.js já limpa tudo automaticamente.
   */
  async function init() {
    const savedToken = localStorage.getItem(TOKEN_KEY)
    if (!savedToken) return

    token.value = savedToken
    await fetchMe()
  }

  /**
   * fetchMe() — busca os dados atuais do usuário logado.
   * Usado no init() para restaurar sessão e pode ser chamado
   * após edição de perfil para sincronizar dados.
   * Se falhar (token inválido/expirado), encerra a sessão.
   */
  async function fetchMe() {
    try {
      const { data } = await api.get('/auth/me')
      user.value = data
    } catch {
      // Token inválido ou expirado — encerra sessão silenciosamente.
      // O interceptor 401 já redireciona para /login se necessário.
      logout()
    }
  }

  /**
   * login() — autentica com email e senha.
   * O backend retorna { access_token, user }.
   */
  async function login(email, password) {
    try {
      const { data } = await api.post('/auth/login', { email, password })
      _saveToken(data.access_token)
      user.value = data.user
    } catch (error) {
      throw new Error(
        error.response?.data?.message ?? 'Erro ao fazer login. Tente novamente.'
      )
    }
  }

  // Shape do body segue o contrato da API.
  async function register(name, username, email, password, password_confirmation) {
    try {
      const { data } = await api.post('/auth/register', {
        name,
        username,
        email,
        password,
        password_confirmation,
      })
      _saveToken(data.access_token)
      user.value = data.user
    } catch (error) {
      // O backend pode retornar erros por campo (ex: { errors: { username: [...] } })
      // ou uma mensagem geral. Repassamos o erro inteiro para a view decidir
      // como exibir — mensagem geral ou erros inline por campo.
      throw error
    }
  }

  /**
   * logout() — encerra a sessão local e notifica o backend.
   * O POST /auth/logout é feito mesmo se o token já estiver
   * inválido — por isso capturamos o erro silenciosamente.
   */
  async function logout() {
    try {
      await api.post('/auth/logout')
    } catch {
      // Ignora erro — o backend pode rejeitar token já expirado.
      // O importante é limpar o estado local independente disso.
    } finally {
      user.value = null
      token.value = null
      localStorage.removeItem(TOKEN_KEY)
    }
  }

  /**
   * updateProfile() — atualiza o estado local do usuário
   * após edição de perfil bem-sucedida.
   * A requisição PUT /users/me é feita na view — aqui só
   * sincronizamos o estado do store com a resposta da API.
   */
  function updateProfile(updatedUser) {
    user.value = { ...user.value, ...updatedUser }
  }

  return {
    // Estado
    user,
    token,
    // Computeds
    isAuthenticated,
    // Ações
    init,
    fetchMe,
    login,
    register,
    logout,
    updateProfile,
  }
})