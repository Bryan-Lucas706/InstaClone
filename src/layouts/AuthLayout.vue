<template>
  <main class="auth-layout">
    <!-- Logo no topo -->
    <div class="auth-layout__header">
      <h1 class="text-center fw-normal">
        Veja momentos do dia a dia dos seus
        <span class="gradient-text">amigos próximos</span>.
      </h1>
      <img
        src="https://static.cdninstagram.com/rsrc.php/yN/r/-erGonz07kB.webp"
        alt=""
        width="700"
      />
    </div>

    <!-- Slot para LoginView ou CadastroView -->
    <div class="auth-layout__form">
      <div class="auth-layout__card">
        <RouterView />
      </div>
    </div>
  </main>
</template>

<style scoped>
.auth-layout {
  min-height: 100vh;
  width: 100vw;
  background: var(--color-bg);
  display: flex;
  align-items: center;
}

.auth-layout__header {
  display: none;
}

.auth-layout__form {
  width: 80%;
  height: 100vh;
  display: flex;
  align-items: center;
  margin: auto;
}

.auth-layout__card {
  width: 100%;
  padding: 30px;
}

/* Remove a borda no mobile para visual mais limpo */
@media (min-width: 768px) {
  .auth-layout__header {
    display: none;
    width: 57%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .auth-layout__form {
    background: var(--color-surface);
    border-left: 2px solid var(--color-border);
    width: 43%;
    height: 100vh;
  }
}
</style>
