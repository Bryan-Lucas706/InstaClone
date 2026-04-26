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

  if (!name.value.trim()) {
    errors.value.name = "Nome é obrigatório.";
    valid = false;
  }

  if (!username.value.trim()) {
    errors.value.username = "Nome de usuário é obrigatório.";
    valid = false;
  } else if (!usernameRegex.test(username.value)) {
    errors.value.username = "Use apenas letras, números, pontos e underscores.";
    valid = false;
  } else if (username.value.length > 30) {
    errors.value.username = "Máximo de 30 caracteres.";
    valid = false;
  }

  if (!email.value.trim()) {
    errors.value.email = "E-mail é obrigatório.";
    valid = false;
  }

  if (!password.value) {
    errors.value.password = "Senha é obrigatória.";
    valid = false;
  } else if (password.value.length < 6) {
    errors.value.password = "Mínimo de 6 caracteres.";
    valid = false;
  }

  if (!passwordConfirmation.value) {
    errors.value.passwordConfirmation = "Confirme sua senha.";
    valid = false;
  } else if (password.value !== passwordConfirmation.value) {
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
    <h2 class="text-center fw-semibold mb-4">
      Criar conta
    </h2>

    <form @submit.prevent="handleRegister" novalidate>
      <!-- Nome -->
      <div class="mb-3">
        <label for="name" class="visually-hidden">Nome completo</label>
        <input
          id="name"
          v-model="name"
          type="text"
          class="form-control"
          :class="{ 'is-invalid': errors.name }"
          placeholder="Nome completo"
          :disabled="isLoading"
        />
        <div v-if="errors.name" class="invalid-feedback">
          {{ errors.name }}
        </div>
      </div>

      <!-- Username -->
      <div class="mb-3">
        <label for="username" class="visually-hidden">Nome de usuário</label>
        <input
          id="username"
          v-model="username"
          type="text"
          class="form-control"
          :class="{ 'is-invalid': errors.username }"
          placeholder="Nome de usuário"
          autocomplete="username"
          :disabled="isLoading"
        />
        <div v-if="errors.username" class="invalid-feedback">
          {{ errors.username }}
        </div>
      </div>

      <!-- Email -->
      <div class="mb-3">
        <label for="email" class="visually-hidden">E-mail</label>
        <input
          id="email"
          v-model="email"
          type="email"
          class="form-control"
          :class="{ 'is-invalid': errors.email }"
          placeholder="E-mail"
          autocomplete="email"
          :disabled="isLoading"
        />
        <div v-if="errors.email" class="invalid-feedback">
          {{ errors.email }}
        </div>
      </div>

      <!-- Senha -->
      <div class="mb-3">
        <label for="password" class="visually-hidden">Senha</label>
        <input
          id="password"
          v-model="password"
          type="password"
          class="form-control"
          :class="{ 'is-invalid': errors.password }"
          placeholder="Senha"
          autocomplete="new-password"
          :disabled="isLoading"
        />
        <div v-if="errors.password" class="invalid-feedback">
          {{ errors.password }}
        </div>
      </div>

      <!-- Confirmar senha -->
      <div class="mb-3">
        <label for="password-confirmation" class="visually-hidden">
          Confirmar senha
        </label>
        <input
          id="password-confirmation"
          v-model="passwordConfirmation"
          type="password"
          class="form-control"
          :class="{ 'is-invalid': errors.passwordConfirmation }"
          placeholder="Confirmar senha"
          autocomplete="new-password"
          :disabled="isLoading"
        />
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
        class="btn w-100 d-flex align-items-center justify-content-center gap-2"
        :disabled="isLoading"
      >
        <Spinner v-if="isLoading" size="sm" />
        <span>{{ isLoading ? "Criando conta..." : "Cadastrar" }}</span>
      </button>
    </form>

    <!-- Link para login -->
    <hr class="my-4" />
    <p class="text-center mb-0">
      Já tem uma conta?
      <RouterLink to="/login" class="fw-semibold"> Entrar </RouterLink>
    </p>
  </div>
</template>
<style scoped>
h2{
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
