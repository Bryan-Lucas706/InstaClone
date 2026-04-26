<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import api from '@/services/api.js'
import Avatar from '@/components/ui/Avatar.vue'
import Spinner from '@/components/ui/Spinner.vue'

const router = useRouter()
const authStore = useAuthStore()

// ── Estado local ─────────────────────────────────────────
const name = ref(authStore.user?.name ?? '')
const username = ref(authStore.user?.username ?? '')
const bio = ref(authStore.user?.bio ?? '')
const isLoading = ref(false)
const isLoadingAvatar = ref(false)
const avatarPreview = ref('')
const avatarFile = ref(null)

const errors = ref({
  name: '',
  username: '',
  bio: '',
  general: '',
})

const usernameRegex = /^[A-Za-z0-9._]+$/
  
function validateForm() {
  Object.keys(errors.value).forEach((k) => (errors.value[k] = ''))
  let valid = true

  if (!name.value.trim()) {
    errors.value.name = 'Nome é obrigatório.'
    valid = false
  } else if (name.value.length > 255) {
    errors.value.name = 'Máximo de 255 caracteres.'
    valid = false
  }

  if (!username.value.trim()) {
    errors.value.username = 'Nome de usuário é obrigatório.'
    valid = false
  } else if (!usernameRegex.test(username.value)) {
    errors.value.username = 'Use apenas letras, números, pontos e underscores.'
    valid = false
  } else if (username.value.length > 30) {
    errors.value.username = 'Máximo de 30 caracteres.'
    valid = false
  }

  if (bio.value.length > 500) {
    errors.value.bio = 'Máximo de 500 caracteres.'
    valid = false
  }

  return valid
}

/**
 * handleAvatarChange() — preview imediato ao selecionar avatar.
 * Valida tamanho máximo de 2MB antes de qualquer upload.
 */
async function handleAvatarChange(event) {
  const file = event.target.files?.[0]
  if (!file) return

  if (file.size > 2 * 1024 * 1024) {
    errors.value.general = 'Avatar muito grande. Máximo 2MB.'
    return
  }

  // Preview imediato com blob URL
  if (avatarPreview.value) URL.revokeObjectURL(avatarPreview.value)
  avatarFile.value = file
  avatarPreview.value = URL.createObjectURL(file)

  // Faz upload do avatar imediatamente ao selecionar
  isLoadingAvatar.value = true
  try {
    const formData = new FormData()
    formData.append('avatar', file)
    const { data } = await api.post('/users/me/avatar', formData, {
      headers: { 'Content-Type': undefined },
    })
    // Atualiza store com novo avatar_url
    authStore.updateProfile(data)
  } catch {
    errors.value.general = 'Erro ao enviar avatar.'
  } finally {
    isLoadingAvatar.value = false
  }
}

async function handleSubmit() {
  if (!validateForm()) return

  isLoading.value = true
  errors.value.general = ''

  try {
    const { data } = await api.put('/users/me', {
      name: name.value,
      username: username.value,
      bio: bio.value,
    })
    authStore.updateProfile(data)
    router.replace('/perfil')
  } catch (error) {
    const apiErrors = error.response?.data?.errors
    if (apiErrors) {
      if (apiErrors.name) errors.value.name = apiErrors.name[0]
      if (apiErrors.username) errors.value.username = apiErrors.username[0]
      if (apiErrors.bio) errors.value.bio = apiErrors.bio[0]
    } else {
      errors.value.general =
        error.response?.data?.message ?? 'Erro ao salvar perfil.'
    }
  } finally {
    isLoading.value = false
  }
}

onUnmounted(() => {
  if (avatarPreview.value) URL.revokeObjectURL(avatarPreview.value)
})
</script>

<template>
  <div class="container py-4" style="max-width: 614px;">
    <h1 class="fw-semibold mb-4" style="font-size: 16px;">
      Editar perfil
    </h1>

    <!-- Avatar -->
    <div class="d-flex align-items-center gap-3 mb-4">
      <div class="position-relative" style="cursor: pointer;" @click="$refs.avatarInput.click()">
        <Avatar
          :src="avatarPreview || authStore.user?.avatar_url"
          :alt="authStore.user?.username"
          size="lg"
        />
        <!-- Overlay de loading no avatar -->
        <div
          v-if="isLoadingAvatar"
          class="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center rounded-circle"
          style="background: rgba(0,0,0,0.4);"
        >
          <Spinner size="sm" style="color: #fff;" />
        </div>
      </div>

      <div>
        <p class="mb-0 fw-semibold" style="font-size: 14px;">
          {{ authStore.user?.username }}
        </p>
        <button
          class="btn btn-link p-0"
          style="font-size: 14px; color: var(--color-primary);"
          @click="$refs.avatarInput.click()"
        >
          Alterar foto
        </button>
      </div>

      <input
        ref="avatarInput"
        type="file"
        accept="image/*"
        class="visually-hidden"
        aria-label="Selecionar avatar"
        @change="handleAvatarChange"
      />
    </div>

    <!-- Formulário -->
    <form @submit.prevent="handleSubmit" novalidate>

      <!-- Nome -->
      <div class="mb-3">
        <label for="name" class="form-label fw-semibold" style="font-size: 14px;">
          Nome
        </label>
        <input
          id="name"
          v-model="name"
          type="text"
          class="form-control"
          :class="{ 'is-invalid': errors.name }"
          maxlength="255"
          :disabled="isLoading"
        />
        <div v-if="errors.name" class="invalid-feedback">{{ errors.name }}</div>
      </div>

      <!-- Username -->
      <div class="mb-3">
        <label for="username" class="form-label fw-semibold" style="font-size: 14px;">
          Nome de usuário
        </label>
        <input
          id="username"
          v-model="username"
          type="text"
          class="form-control"
          :class="{ 'is-invalid': errors.username }"
          maxlength="30"
          :disabled="isLoading"
        />
        <div v-if="errors.username" class="invalid-feedback">{{ errors.username }}</div>
      </div>

      <!-- Bio -->
      <div class="mb-3">
        <label for="bio" class="form-label fw-semibold" style="font-size: 14px;">
          Bio
        </label>
        <textarea
          id="bio"
          v-model="bio"
          class="form-control"
          :class="{ 'is-invalid': errors.bio }"
          rows="3"
          maxlength="500"
          style="resize: none;"
          :disabled="isLoading"
        />
        <div class="d-flex justify-content-between mt-1">
          <div v-if="errors.bio" class="invalid-feedback d-block">{{ errors.bio }}</div>
          <span
            class="ms-auto"
            style="font-size: 12px; color: var(--color-text-muted);"
          >
            {{ bio.length }} / 500
          </span>
        </div>
      </div>

      <!-- Erro geral -->
      <div v-if="errors.general" class="alert alert-danger py-2">
        {{ errors.general }}
      </div>

      <!-- Botões -->
      <div class="d-flex gap-2">
        <button
          type="button"
          class="btn flex-grow-1"
          style="border: 1px solid var(--color-border);"
          @click="router.back()"
        >
          Cancelar
        </button>
        <button
          type="submit"
          class="btn flex-grow-1 d-flex align-items-center justify-content-center gap-2"
          style="background: var(--color-primary); color: #fff;"
          :disabled="isLoading"
        >
          <Spinner v-if="isLoading" size="sm" />
          <span>{{ isLoading ? 'Salvando...' : 'Salvar' }}</span>
        </button>
      </div>
    </form>
  </div>
</template>