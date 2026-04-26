<script setup>
defineProps({
  title: {
    type: String,
    default: 'Confirmar',
  },
  message: {
    type: String,
    required: true,
  },
  confirmLabel: {
    type: String,
    default: 'Confirmar',
  },
  cancelLabel: {
    type: String,
    default: 'Cancelar',
  },
})

const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <!-- Overlay fullscreen que bloqueia interação com o fundo -->
  <div class="modal-overlay" @click.self="emit('cancel')">
    <div class="confirm-modal" role="dialog" :aria-label="title">
      <h3 class="modal__title">{{ title }}</h3>
      <p class="modal__message">{{ message }}</p>
      <div class="modal__actions">
        <button
          class="modal__btn modal__btn--cancel"
          @click="emit('cancel')"
        >
          {{ cancelLabel }}
        </button>
        <button
          class="modal__btn modal__btn--confirm"
          @click="emit('confirm')"
        >
          {{ confirmLabel }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.confirm-modal {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  padding: 24px;
  width: 100%;
  max-width: 400px;
  box-shadow: var(--shadow-modal);
}

.modal__title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 8px;
}

.modal__message {
  font-size: 14px;
  color: var(--color-text-muted);
  margin-bottom: 24px;
  line-height: 1.5;
}

.modal__actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.modal__btn {
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 600;
  transition: opacity var(--transition-fast);
}

.modal__btn:hover {
  opacity: 0.85;
}

.modal__btn--cancel {
  background: transparent;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
}

.modal__btn--confirm {
  background: #ed4956;
  color: #fff;
  border: none;
}
</style>