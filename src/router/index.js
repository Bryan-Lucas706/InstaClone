import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ─── Rota raiz ───────────────────────────────────────────
    {
      path: '/',
      redirect: '/feed',
    },

    // ─── Rotas públicas (requiresGuest) ──────────────────────
    {
      path: '/login',
      component: () => import('@/layouts/AuthLayout.vue'),
      meta: { requiresGuest: true },
      children: [
        {
          path: '',
          name: 'login',
          component: () => import('@/views/auth/LoginView.vue'),
        },
      ],
    },
    {
      path: '/cadastro',
      component: () => import('@/layouts/AuthLayout.vue'),
      meta: { requiresGuest: true },
      children: [
        {
          path: '',
          name: 'cadastro',
          component: () => import('@/views/auth/CadastroView.vue'),
        },
      ],
    },

    // ─── Rotas protegidas (requiresAuth) ─────────────────────
    {
      path: '/',
      component: () => import('@/layouts/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: 'feed',
          name: 'feed',
          component: () => import('@/views/FeedView.vue'),
        },
        {
          path: 'descobrir',
          name: 'descobrir',
          component: () => import('@/views/DescubrirView.vue'),
        },
        {
          path: 'criar',
          name: 'criar',
          component: () => import('@/views/CriarPostView.vue'),
        },
        {
          path: 'perfil',
          name: 'perfil',
          component: () => import('@/views/PerfilView.vue'),
        },
        {
          path: 'perfil/editar',
          name: 'perfil-editar',
          component: () => import('@/views/EditarPerfilView.vue'),
        },
        {
          path: 'perfil/lista/:type',
          name: 'perfil-lista',
          component: () => import('@/views/ListaConexoesView.vue'),
        },
        {
          path: 'posts/:postId',
          name: 'post-detail',
          component: () => import('@/views/PostDetailView.vue'),
        },
      ],
    },

    // ─── 404 ─────────────────────────────────────────────────
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],
})

// --- Navigation Guard ---
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  const requiresAuth = to.matched.some((r) => r.meta.requiresAuth)
  const requiresGuest = to.matched.some((r) => r.meta.requiresGuest)

  if (requiresAuth && !authStore.isAuthenticated) {
    return next('/login')
  }

  if (requiresGuest && authStore.isAuthenticated) {
    return next('/feed')
  }

  next()
})

export default router