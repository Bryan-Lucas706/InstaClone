InstaClone — Frontend (Vue 3)
Sobre
O InstaClone é uma rede social inspirada no Instagram, construída como projeto final da disciplina. Este repositório contém o frontend da aplicação: uma SPA em Vue 3 que consome uma API RESTful externa (o backend do projeto vive em ../backend).

A aplicação está integrada à API: autenticação por JWT, feed paginado por cursor, upload multipart de imagens e gerenciamento de seguidores/curtidas/comentários vêm todos do servidor. O único estado persistido localmente é o token de acesso, guardado em localStorage sob a chave instaclone.token.

Stack
Vue 3 (^3.5) com <script setup>
Vite 8 como bundler/dev server
Vue Router 4 com histórico HTML5, guards globais e views lazy-loaded
Pinia 3 para estado compartilhado
Axios como cliente HTTP, com interceptors de Authorization e 401
Bootstrap 5 (reset/utilidades) + tema CSS próprio em src/assets/styles/theme.css
Node.js ^20.19.0 || >=22.12.0

Como Rodar
# instalar dependências

npm install
# subir em modo desenvolvimento (http://localhost:5173)

npm run dev
# build de produção para ./dist

npm run build 
# pré-visualizar o build

npm run preview
Variáveis de Ambiente
Copie .env.example para .env e ajuste a URL da API se necessário:

VITE_API_URL=http://localhost:8000/api
Quando a variável não é definida, o cliente HTTP em src/services/api.js usa http://localhost:8000/api como fallback.

Docker
O projeto tem um build multi-stage (Dockerfile) que gera os assets com Node e serve o dist/ via Nginx. Para subir com Docker Compose:

docker compose up --build
O serviço fica exposto em http://localhost:3000 (compose.yaml). Passe VITE_API_URL para o build quando a API não estiver em localhost:8000.
