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
    <h2 class="text-center fw-normal mb-4">Entrar no Instagram</h2>

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
        class="w-100 text-center fs-5"
        :disabled="isLoading || !password || !email"
      >
        <Spinner v-if="isLoading" size="sm" />
        <span>{{ isLoading ? "Entrando..." : "Entrar" }}</span>
      </button>
    </form>

    <!-- Link para cadastro -->
    <button class="create__accont w-100 text-center fs-5">
      <RouterLink to="/register"
        >Criar nova conta</RouterLink
      >
    </button>
  </div>
</template>
<style scoped>
h2 {
  font-size: 1.3em;
  justify-self: self-start;
  font-weight: lighter;
}

button {
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 10px;
  margin: 10px 0;
  text-align: center;
}

button:disabled {
  opacity: 0.3;
}

.create__accont {
  background-color: transparent;
  border: 1px solid var(--color-primary);
}

a {
  color: var(--color-primary);
}

input {
  width: 100%;
  padding: 20px;
  border-radius: 18px;
}
</style>
