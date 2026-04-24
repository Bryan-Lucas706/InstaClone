<template>
  <div class="auth-layout">
    <!-- Logo no topo -->
    <header class="auth-layout__header">
      <h1 class="auth-layout__logo gradient-text">InstaClone</h1>
    </header>

    <!-- Slot para LoginView ou CadastroView -->
    <main class="auth-layout__main">
      <div class="auth-layout__card">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<style scoped>
.auth-layout {
  min-height: 100vh;
  background: var(--color-bg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
}

.auth-layout__header {
  margin-bottom: 24px;
}

.auth-layout__logo {
  font-size: 36px;
  font-weight: 700;
  font-family: 'Segoe UI', system-ui, sans-serif;
  letter-spacing: -1px;
}

.auth-layout__card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 32px;
  width: 100%;
  max-width: 400px;
}

/* Remove a borda no mobile para visual mais limpo */
@media (max-width: 480px) {
  .auth-layout__card {
    border: none;
    padding: 24px 8px;
    background: transparent;
  }
}
</style>
