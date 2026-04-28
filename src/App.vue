<script setup>
import { onMounted } from "vue";
import { useAuthStore } from "@/stores/auth.js";

const authStore = useAuthStore();

// Se existir token no localStorage, fetchMe() é chamado
// para restaurar os dados do usuário sem precisar logar novamente.
onMounted(async () => {
  await authStore.init();
});
</script>

<template>
  <RouterView v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </RouterView>
</template>
