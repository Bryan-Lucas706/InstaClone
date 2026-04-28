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
  errorMessage.value = "";
  isLoading.value = true;
  try {
    await authStore.login(email.value, password.value);
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
    <h2 class="fw-normal fs-5 mb-4">Entrar no Instagram</h2>

    <form @submit.prevent="handleLogin" novalidate>
      <!-- Email -->
      <div class="field mb-3">
        <input
          v-model="email"
          type="email"
          placeholder=" "
          autocomplete="email"
          :disabled="isLoading"
        />
        <label for="email">E-mail</label>
      </div>

      <!-- Senha -->
      <div class="field mb-3">
        <input
          v-model="password"
          type="password"
          placeholder=" "
          autocomplete="current-password"
          :disabled="isLoading"
        />
        <label for="password">Senha</label>
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
        class="w-100 text-center fs-6"
        :disabled="isLoading || !password || !email"
      >
        <Spinner v-if="isLoading" size="sm" />
        <span>{{ isLoading ? "Entrando..." : "Entrar" }}</span>
      </button>
    </form>

    <!-- Link para cadastro -->
    <RouterLink to="/register">
      <button class="create__accont w-100 text-center fs-6">
        Criar nova conta
      </button>
    </RouterLink>
  </div>
</template>
<style scoped>
button {
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: 15px;
  padding: 10px;
  margin: 10px 0;
  text-align: center;
}

button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.create__accont {
  background-color: transparent;
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
}

a {
  color: var(--color-primary);
}

.field {
  position: relative;
}

input {
  width: 100%;
  height: 60px;
  padding-left: 15px;
  border-radius: 18px;
  border: 1px solid var(--color-border);
  outline: none;
}

input:focus,
input:hover {
  border: 1px solid var(--color-primary);
}

label {
  color: var(--color-text-muted);
  position: absolute;
  top: 50%;
  left: 15px;
  transform: translateY(-50%);
  transition: all 0.2s ease;
  font-size: 1.2em;
  pointer-events: none;
}

input:focus ~ label,
input:not(:placeholder-shown) ~ label {
  top: 0.2em;
  transform: none;
  font-size: 1em;
}
</style>
