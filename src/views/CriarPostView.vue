<script setup>
import { ref, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useFeedStore } from "@/stores/feed.js";
import Spinner from "@/components/ui/Spinner.vue";

const router = useRouter();
const feedStore = useFeedStore();

// ── Estados internos do fluxo ─────────────────────────────
// 'select' → 'edit' → 'publishing'
const step = ref("select");

// ── Estado local ─────────────────────────────────────────
const selectedFile = ref(null);
const previewUrl = ref("");
const caption = ref("");
const errorMessage = ref("");
const publishSuccess = ref(false);

// ── Drag and drop ─────────────────────────────────────────
const isDragging = ref(false);

// ── Validações de arquivo ─────────────────────────────────
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

function onDrop(event) {
  isDragging.value = false;
  const file = event.dataTransfer.files?.[0];
  if (file) handleFileSelect(file);
}

function onFileInputChange(event) {
  const file = event.target.files?.[0];
  if (file) handleFileSelect(file);
}

function validateFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Formato inválido. Use JPEG, JPG, PNG ou WebP.";
  }
  if (file.size > MAX_SIZE_BYTES) {
    return `Arquivo muito grande. Máximo ${MAX_SIZE_MB}MB.`;
  }
  return null;
}

/**
 * handleFileSelect() — chamado ao selecionar arquivo pelo input
 * ou pelo drag and drop.
 * Usa URL.createObjectURL em vez de FileReader porque é mais
 * performático — não precisa ler o arquivo inteiro para o preview.
 */
function handleFileSelect(file) {
  errorMessage.value = "";
  const error = validateFile(file);
  if (error) {
    errorMessage.value = error;
    return;
  }

  // Revoga/Quebra a URL do antido arquivo se existir
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
  }

  selectedFile.value = file;
  previewUrl.value = URL.createObjectURL(file);
  step.value = "edit";
}

/**
 * handlePublish() — monta o FormData e chama feedStore.createPost().
 * FormData é necessário para enviar arquivo + texto juntos
 * como multipart/form-data conforme exige o backend.
 */
async function handlePublish() {
  if (!selectedFile.value) return;

  step.value = "publishing";
  errorMessage.value = "";

  try {
    const formData = new FormData();
    formData.append("image", selectedFile.value);
    formData.append("caption", caption.value);

    await feedStore.createPost(formData);

    // Revoga o blob após upload bem-sucedido
    URL.revokeObjectURL(previewUrl.value);
    publishSuccess.value = true;

    // Redireciona após 1.5s para o usuário ver o feedback
    setTimeout(() => router.replace("/feed"), 1500);
  } catch {
    errorMessage.value = "Erro ao publicar. Tente novamente.";
    // Volta para edição preservando imagem e legenda
    step.value = "edit";
  }
}

function goBack() {
  URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = "";
  selectedFile.value = null;
  caption.value = "";
  errorMessage.value = "";
  step.value = "select";
}

// Garante que o blob é revogado ao sair da view
// mesmo que o usuário navegue sem publicar
onUnmounted(() => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
  }
});
</script>

<template>
  <div class="container py-4" style="max-width: 614px">
    <h1 class="fw-semibold mb-4" style="font-size: 16px">Criar post</h1>

    <!-- ── Estado 1: Seleção ── -->
    <div v-if="step === 'select'">
      <div
        class="drop-zone d-flex flex-column align-items-center justify-content-center gap-3 rounded p-5"
        :class="{ 'drop-zone--active': isDragging }"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="onDrop"
        @click="$refs.fileInput.click()"
      >
        <!-- Ícone de upload -->
        <i class="fa-regular fa-copy" style="font-size: 4em"></i>
        <div class="text-center">
          <p class="mb-1 fw-semibold" style="font-size: 16px">
            Arraste ou clique para selecionar
          </p>
          <p
            class="mb-0"
            style="font-size: 13px; color: var(--color-text-muted)"
          >
            JPEG, PNG ou WebP • Máximo 5MB
          </p>
        </div>

        <!-- Input oculto — acionado pelo clique na área -->
        <input
          ref="fileInput"
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          class="visually-hidden"
          aria-label="Selecionar imagem"
          @change="onFileInputChange"
        />
      </div>

      <!-- Erro de validação -->
      <div v-if="errorMessage" class="alert alert-danger mt-3">
        {{ errorMessage }}
      </div>
    </div>

    <!-- ── Estado 2: Edição ── -->
    <div v-else-if="step === 'edit'">
      <div class="row g-4">
        <!-- Preview da imagem -->
        <div class="col-12 col-md-6">
          <img
            :src="previewUrl"
            alt="Preview do post"
            class="w-100 rounded"
            style="object-fit: cover"
          />
        </div>

        <!-- Formulário -->
        <div class="col-12 col-md-6 d-flex flex-column gap-3">
          <!-- Legenda -->
          <div>
            <label for="caption" class="visually-hidden">Legenda</label>
            <textarea
              id="caption"
              v-model="caption"
              class="form-control"
              placeholder="Escreva uma legenda..."
              rows="5"
              maxlength="2000"
              style="resize: none"
            />
            <div
              class="text-end mt-1"
              style="font-size: 12px; color: var(--color-text-muted)"
            >
              {{ caption.length }} / 2000
            </div>
          </div>

          <!-- Erro -->
          <div v-if="errorMessage" class="alert alert-danger py-2">
            {{ errorMessage }}
          </div>

          <!-- Botões -->
          <div class="d-flex gap-2">
            <button
              class="btn flex-grow-1"
              style="border: 1px solid var(--color-border)"
              @click="goBack"
            >
              Voltar
            </button>
            <button
              class="btn flex-grow-1"
              style="background: var(--color-primary); color: #fff"
              :disabled="!selectedFile || !caption.trim()"
              @click="handlePublish"
            >
              Compartilhar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Estado 3: Publicando ── -->
    <div
      v-else-if="step === 'publishing'"
      class="d-flex flex-column align-items-center justify-content-center gap-3 py-5"
    >
      <!-- Sucesso -->
      <template v-if="publishSuccess">
        <i class="fa-solid fa-circle-check" style="font-size: 3em"></i>
        <p class="fw-semibold mb-0" style="font-size: 18px">Post publicado!</p>
        <p style="color: var(--color-text-muted); font-size: 14px">
          Redirecionando para o feed...
        </p>
      </template>

      <!-- Publicando -->
      <template v-else>
        <Spinner size="lg" />
        <p class="mb-0" style="color: var(--color-text-muted)">Publicando...</p>
      </template>
    </div>
  </div>
</template>

<style scoped>
.drop-zone {
  border: 2px dashed var(--color-border);
  background: var(--color-surface);
  cursor: pointer;
  transition:
    border-color var(--transition-fast),
    background var(--transition-fast);
  min-height: 280px;
}

.drop-zone:hover,
.drop-zone--active {
  border-color: var(--color-primary);
  background: #f0f8ff;
}
</style>
