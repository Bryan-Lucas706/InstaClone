// Toda comunicação com o backend via api passa por aqui.
// Interceptors garantem que token e erros de autenticação
// sejam tratados globalmente, sem repetição nas views/stores.
import axios from "axios";

// Chave fixa do token — definida aqui para evitar typos
// espalhados pelo código.
export const TOKEN_KEY = "instaclone.token";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- Interceptor de REQUEST ---
// Lê o token a cada requisição, garantindo o estado mais atual da sessão
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// --- Interceptor de RESPONSE ---
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Status 401: sessão expirada ou token inválido.
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
