// ============================================================
// INSTACLONE — Cliente HTTP centralizado (Axios)
//
// Esta instância está pronta para quando a API real for conectada.
// Hoje a aplicação opera em modo local-first (localStorage + mock),
// mas toda a comunicação futura com o backend passará por aqui,
// sem necessidade de alterar os stores ou views.
// ============================================================

import axios from "axios";

// Cria instância isolada para não poluir o Axios global.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
  timeout: 8000,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- Interceptor de REQUEST ---
// Injeta o token JWT em toda requisição que sair da aplicação.
// O token é lido do localStorage a cada chamada (não em memória)
// para garantir que sempre reflete o estado mais atual da sessão.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("instaclone_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// --- Interceptor de RESPONSE ---
/* Se a resposta for um erro 401, ele remove o token e o usuario do localStorage. Por que se o Token espirar ou for invalido, o usuario é desconectado e é redirecionado a pagina de login
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("instaclone_token");
      localStorage.removeItem("instaclone_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
