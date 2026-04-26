<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth.js";
import Spinner from "@/components/ui/Spinner.vue";

const router = useRouter();
const authStore = useAuthStore();

// Estado local — campos de formulário nunca vão para o store
const email = ref("");
const password = ref("");
const errorMessage = ref("");
const isLoading = ref(false);

async function handleLogin() {
  // Validação client-side antes de qualquer requisição
  if (!email.value || !password.value) {
    errorMessage.value = "Preencha todos os campos.";
    return;
  }

  errorMessage.value = "";
  isLoading.value = true;

  try {
    await authStore.login(email.value, password.value);
    // replace em vez de push para não deixar /login no histórico
    router.replace("/feed");
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div>
    <h2 class="text-center fw-semibold mb-4">Entrar</h2>

    <form @submit.prevent="handleLogin" novalidate>
      <!-- Email -->
      <div class="mb-3">
        <label for="email" class="visually-hidden">E-mail</label>
        <input
          id="email"
          v-model="email"
          type="email"
          class="form-control"
          placeholder="E-mail"
          autocomplete="email"
          :disabled="isLoading"
        />
      </div>

      <!-- Senha -->
      <div class="mb-3">
        <label for="password" class="visually-hidden">Senha</label>
        <input
          id="password"
          v-model="password"
          type="password"
          class="form-control"
          placeholder="Senha"
          autocomplete="current-password"
          :disabled="isLoading"
        />
      </div>

      <!-- Mensagem de erro -->
      <div
        v-if="errorMessage"
        class="alert alert-danger py-2 mb-3"
        role="alert"
      >
        {{ errorMessage }}
      </div>

      <!-- Botão de submit -->
      <button
        type="submit"
        class="btn w-100 d-flex align-items-center justify-content-center gap-2"
        :disabled="isLoading"
      >
        <Spinner v-if="isLoading" size="sm" />
        <span>{{ isLoading ? "Entrando..." : "Entrar" }}</span>
      </button>
    </form>

    <!-- Link para cadastro -->
    <hr class="my-4" />
    <p class="text-center mb-0">
      Não tem uma conta?
      <RouterLink to="/register" class="fw-semibold"> Cadastre-se </RouterLink>
    </p>
  </div>
</template>
<style scoped>
h2 {
  font-size: 1.3em;
}
button {
  background: var(--color-primary);
  color: #fff;
}

a {
  color: var(--color-primary);
}
</style>
