<template>
  <div class="auth-layout">
    <!-- Logo no topo -->
    <header class="auth-layout__header">
      <h1 class="text-center fw-normal">
        Veja momentos do dia a dia dos <br />
        seus <span class="gradient-text">amigos próximos</span>.
      </h1>
      <img
        src="https://static.cdninstagram.com/rsrc.php/yN/r/-erGonz07kB.webp"
        alt=""
        width="700"
      />
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
  width: 100vw;
  background: var(--color-bg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-layout__header {
  width: 55%;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.auth-layout__main {
  background: var(--color-surface);
  border-left: 1px solid var(--color-border);
  width: 45%;
  height: 100vh;
  display: flex;
  align-items: center;
}

.auth-layout__card {
  padding: 32px;
  width: 100%;
}

.auth-layout__card input {
  width: 100%;
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
