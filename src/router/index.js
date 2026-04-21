import { createRouter, createWebHistory } from "vue-router";

const routes = [
  // ── ROTAS PÚBLICAS ──────────────────────────
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/LoginView.vue"),
    meta: { public: true },
  },
  {
    path: "/register",
    name: "register",
    component: () => import("@/views/RegisterView.vue"),
    meta: { public: true },
  },

  // ── ROTAS PROTEGIDAS ────────────────────────
  {
    path: "/feed",
    name: "feed",
    component: () => import("@/views/FeedView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/create",
    name: "create",
    component: () => import("@/views/CreatePostView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/post/:id",
    name: "post",
    component: () => import("@/views/PostDetailView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/profile/edit",
    name: "profile-edit",
    component: () => import("@/views/EditProfileView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/profile/:username",
    name: "profile",
    component: () => import("@/views/ProfileView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/profile/:username/followers",
    name: "followers",
    component: () => import("@/views/FollowersView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/profile/:username/following",
    name: "following",
    component: () => import("@/views/FollowingView.vue"),
    meta: { requiresAuth: true },
  },

  // ── ROTA RAIZ ───────────────────────────────
  {
    path: "/",
    redirect: "/feed",
  },

  // ── ROTA 404 ────────────────────────────────
  {
    path: "/:pathMatch(.*)*",
    redirect: "/feed",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem("token");
  const requiresAuth = to.meta.requiresAuth;
  const isPublic = to.meta.public;

  if (requiresAuth && !token) {
    next({ name: "login" });
    return;
  }

  if (isPublic && token) {
    next({ name: "feed" });
    return;
  }

  next();
});

export default router;
