<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth.js";
import Spinner from "@/components/ui/Spinner.vue";

const router = useRouter();
const authStore = useAuthStore();

// Estado local — todos os campos do formulário
const name = ref("");
const username = ref("");
const email = ref("");
const password = ref("");
const passwordConfirmation = ref("");
const isLoading = ref(false);

// Erros por campo — objeto para exibir inline abaixo de cada input
const errors = ref({
  name: "",
  username: "",
  email: "",
  password: "",
  passwordConfirmation: "",
  general: "",
});

// Regex do contrato da API — apenas letras, números, pontos e underscores
const usernameRegex = /^[A-Za-z0-9._]+$/;

function validateForm() {
  // Limpa erros anteriores
  Object.keys(errors.value).forEach((k) => (errors.value[k] = ""));
  let valid = true;

  if (!usernameRegex.test(username.value)) {
    errors.value.username = "Use apenas letras, números, pontos e underscores.";
    valid = false;
  } else if (username.value.length > 30) {
    errors.value.username = "Máximo de 30 caracteres.";
    valid = false;
  }

  if (password.value.length < 6) {
    errors.value.password = "Mínimo de 6 caracteres.";
    valid = false;
  }

  if (password.value !== passwordConfirmation.value) {
    errors.value.passwordConfirmation = "As senhas não coincidem.";
    valid = false;
  }

  return valid;
}

async function handleRegister() {
  if (!validateForm()) return;

  isLoading.value = true;
  try {
    await authStore.register(
      name.value,
      username.value,
      email.value,
      password.value,
      passwordConfirmation.value,
    );
    router.replace("/feed");
  } catch (error) {
    // O backend pode retornar erros por campo em error.response.data.errors
    // ou uma mensagem geral em error.response.data.message
    const apiErrors = error.response?.data?.errors;
    if (apiErrors) {
      // Mapeia erros por campo vindos da API para o objeto errors
      if (apiErrors.name) errors.value.name = apiErrors.name[0];
      if (apiErrors.username) errors.value.username = apiErrors.username[0];
      if (apiErrors.email) errors.value.email = apiErrors.email[0];
      if (apiErrors.password) errors.value.password = apiErrors.password[0];
    } else {
      errors.value.general =
        error.response?.data?.message ??
        "Erro ao criar conta. Tente novamente.";
    }
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div>
    <h2 class="text-center mb-4">Criar conta</h2>

    <form @submit.prevent="handleRegister" novalidate>
      <!-- Nome -->
      <div class="mb-3 field">
        <input
          v-model="name"
          type="text"
          :class="{ 'is-invalid': errors.name }"
          placeholder=" "
          :disabled="isLoading"
        />
        <label for="name">Nome completo</label>
        <div v-if="errors.name" class="invalid-feedback">
          {{ errors.name }}
        </div>
      </div>

      <!-- Username -->
      <div class="mb-3 field">
        <input
          v-model="username"
          type="text"
          :class="{ 'is-invalid': errors.username }"
          placeholder=" "
          autocomplete="username"
          :disabled="isLoading"
        />
        <label for="username">Nome de usuário</label>
        <div v-if="errors.username" class="invalid-feedback">
          {{ errors.username }}
        </div>
      </div>

      <!-- Email -->
      <div class="mb-3 field">
        <input
          v-model="email"
          type="email"
          :class="{ 'is-invalid': errors.email }"
          placeholder=" "
          autocomplete="email"
          :disabled="isLoading"
        />
        <label for="email">E-mail</label>
        <div v-if="errors.email" class="invalid-feedback">
          {{ errors.email }}
        </div>
      </div>

      <!-- Senha -->
      <div class="mb-3 field">
        <input
          v-model="password"
          type="password"
          :class="{ 'is-invalid': errors.password }"
          placeholder=" "
          autocomplete="new-password"
          :disabled="isLoading"
        />
        <label for="password">Senha</label>
        <div v-if="errors.password" class="invalid-feedback">
          {{ errors.password }}
        </div>
      </div>

      <!-- Confirmar senha -->
      <div class="mb-3 field">
        <input
          v-model="passwordConfirmation"
          type="password"
          :class="{ 'is-invalid': errors.passwordConfirmation }"
          placeholder=" "
          autocomplete="new-password"
          :disabled="isLoading"
        />
        <label for="password-confirmation">Confirmar senha</label>
        <div v-if="errors.passwordConfirmation" class="invalid-feedback">
          {{ errors.passwordConfirmation }}
        </div>
      </div>

      <!-- Erro geral -->
      <div
        v-if="errors.general"
        class="alert alert-danger py-2 mb-3"
        role="alert"
      >
        {{ errors.general }}
      </div>

      <!-- Botão submit -->
      <button
        type="submit"
        class="w-100 text-center fs-6"
        :disabled="
          isLoading ||
          !name ||
          !username ||
          !email ||
          !password ||
          !passwordConfirmation
        "
      >
        <Spinner v-if="isLoading" size="sm" />
        <span>{{ isLoading ? "Criando conta..." : "Cadastrar" }}</span>
      </button>
    </form>

    <!-- Link para login -->
    <RouterLink to="/login">
      <button class="create__accont w-100 text-center fs-6">Entrar</button>
    </RouterLink>
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
  cursor: not-allowed;
}

.create__accont {
  background-color: transparent;
  border: 1px solid var(--color-primary);
  color: var(--color-primary);
}
</style>
