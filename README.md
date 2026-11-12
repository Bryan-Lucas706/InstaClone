InstaClone — Frontend (Vue 3)
Sobre
O InstaClone é uma rede social inspirada no Instagram, construída como projeto final da disciplina. Este repositório contém o frontend da aplicação: uma SPA em Vue 3 que consome a API RESTful Laravel localizada em `instaclone-backend/`.

A aplicação está integrada à API: autenticação por token Bearer do Laravel Sanctum, feed paginado por cursor, upload multipart de imagens e gerenciamento de seguidores/curtidas/comentários vêm todos do servidor. O único estado persistido localmente é o token de acesso, guardado em localStorage sob a chave `instaclone.token`.

Créditos
O backend localizado em `instaclone-backend/` foi desenvolvido pelo professor Victor Raphael. A API Laravel organiza os recursos de autenticação, perfis, publicações, feed, seguidores, curtidas e comentários, além de disponibilizar documentação OpenAPI. Agradeço ao professor pelo desenvolvimento e por compartilhar essa base, que tornou possível integrar a interface a uma API completa.

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
Copie `.env.example` para `.env` e ajuste a URL da API se necessário:

VITE_API_URL=http://localhost:8000/api
O backend em `instaclone-backend/` expõe a API em `http://localhost:8000/api` por padrão. Defina `VITE_API_URL` para essa URL ao rodar o frontend localmente; o cliente HTTP não define uma URL padrão quando a variável está ausente.

Docker
O projeto tem um build multi-stage (`Dockerfile`) que gera os assets com Node e serve o `dist/` via Nginx. O `compose.yaml` desta pasta sobe apenas o frontend. Para subir com Docker Compose:

docker compose up --build
O frontend fica exposto em `http://localhost:3000` (`compose.yaml`). Inicie a API separadamente usando as instruções em `instaclone-backend/README.md`. Passe `VITE_API_URL` para o build quando a API não estiver em `http://localhost:8000`.
