<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "../lib/supabase";

const router = useRouter();

const email = ref("");
const password = ref("");
const loading = ref(false);
const errorMessage = ref("");

onMounted(async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    router.push("/admin");
  }
});

async function handleLogin() {
  errorMessage.value = "";
  loading.value = true;

  const { error } = await supabase.auth.signInWithPassword({
    email: email.value.trim(),
    password: password.value,
  });

  if (error) {
    errorMessage.value = error.message || "Impossible de se connecter.";
    loading.value = false;
    return;
  }

  loading.value = false;
  router.push("/admin");
}
</script>

<template>
  <main class="min-h-screen bg-[#f7f2ea] px-6 py-10">
    <div class="mx-auto max-w-md rounded-[2rem] bg-white p-8 shadow-sm">
      <p class="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
        Admin
      </p>

      <h1 class="mt-3 text-3xl font-bold">Connexion</h1>

      <p class="mt-3 text-sm leading-7 text-zinc-600">
        Connecte-toi pour gérer les produits du catalogue YSAB.
      </p>

      <form class="mt-8 space-y-5" @submit.prevent="handleLogin">
        <div>
          <label class="mb-2 block text-sm font-medium">Email</label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none transition focus:border-black"
            placeholder="admin@email.com"
          />
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium">Mot de passe</label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none transition focus:border-black"
            placeholder="••••••••"
          />
        </div>

        <p v-if="errorMessage" class="text-sm text-red-600">
          {{ errorMessage }}
        </p>

        <button
          type="submit"
          :disabled="loading"
          class="inline-flex w-full items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-bold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ loading ? "Connexion..." : "Se connecter" }}
        </button>
      </form>
    </div>
  </main>
</template>