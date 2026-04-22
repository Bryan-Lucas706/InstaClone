// ============================================================
// INSTACLONE — Cliente HTTP centralizado (Axios)
//
// Toda comunicação com o backend passa por aqui.
// Interceptors garantem que token e erros de autenticação
// sejam tratados globalmente, sem repetição nas views/stores.
// ============================================================

import axios from 'axios'

// Chave fixa do token — definida aqui para evitar typos
// espalhados pelo código. Qualquer mudança futura é feita
// em um único lugar.
export const TOKEN_KEY = 'instaclone.token'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// --- Interceptor de REQUEST ---
// Lê o token a cada requisição (não em memória) para garantir
// que sempre reflete o estado mais atual da sessão.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// --- Interceptor de RESPONSE ---
// Status 401: sessão expirada ou token inválido.
// Usamos window.location em vez de router.push para evitar
// dependência circular (api.js ← router ← stores ← api.js).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api