import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth.js";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ─── Rota raiz ───────────────────────────────────────────
    {
      path: "/",
      redirect: "/feed",
    },

    // ─── Rotas públicas (requiresGuest) ──────────────────────
    {
      path: "/login",
      component: () => import("@/layouts/AuthLayout.vue"),
      meta: { requiresGuest: true },
      children: [
        {
          path: "",
          name: "login",
          component: () => import("@/views/auth/LoginView.vue"),
        },
      ],
    },
    {
      path: "/register",
      component: () => import("@/layouts/AuthLayout.vue"),
      meta: { requiresGuest: true },
      children: [
        {
          path: "",
          name: "register",
          component: () => import("@/views/auth/RegisterView.vue"),
        },
      ],
    },

    // ─── Rotas protegidas (requiresAuth) ─────────────────────
    {
      path: "/",
      component: () => import("@/layouts/AppLayout.vue"),
      meta: { requiresAuth: true },
      children: [
        {
          path: "feed",
          name: "feed",
          component: () => import("@/views/FeedView.vue"),
        },
        {
          path: "discover",
          name: "discover",
          component: () => import("@/views/DiscoverView.vue"),
        },
        {
          path: "create",
          name: "create",
          component: () => import("@/views/CreatePostView.vue"),
        },
        {
          path: "profile",
          name: "profile",
          component: () => import("@/views/ProfileView.vue"),
        },
        {
          path: "profile/edit",
          name: "profile-edit",
          component: () => import("@/views/EditProfileView.vue"),
        },
        {
          path: "profile/list/:type",
          name: "profile-list",
          component: () => import("@/views/ConnectionListView.vue"),
        },
        {
          path: "posts/:postId",
          name: "post-detail",
          component: () => import("@/views/PostDetailView.vue"),
        },
      ],
    },

    // ─── 404 ─────────────────────────────────────────────────
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("@/views/NotFoundView.vue"),
    },
  ],
});

// --- Navigation Guard ---
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();

  const requiresAuth = to.matched.some((r) => r.meta.requiresAuth);
  const requiresGuest = to.matched.some((r) => r.meta.requiresGuest);
  // to.matched é uma rota pai + filha que compartilham com o destino.
  if (requiresAuth && !authStore.isAuthenticated) {
    return next("/login");
  }

  if (requiresGuest && authStore.isAuthenticated) {
    return next("/feed");
  }

  next();
});

export default router;
