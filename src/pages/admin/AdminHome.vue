<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "../../lib/supabase";

const router = useRouter();
const userEmail = ref("");

onMounted(async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  userEmail.value = user?.email || "";
});

async function handleLogout() {
  await supabase.auth.signOut();
  router.push("/login");
}
</script>

<template>
  <main class="min-h-screen bg-[#f7f2ea] px-6 py-10">
    <div class="mx-auto max-w-6xl">
      <div class="mb-8 flex items-center justify-between">
        <div>
          <p class="text-xs uppercase tracking-[0.3em] text-zinc-500">
            Dashboard
          </p>

          <h1 class="mt-2 text-3xl font-bold">
            Admin YSAB
          </h1>

          <p class="mt-2 text-sm text-zinc-600">
            Connecté : {{ userEmail }}
          </p>
        </div>

        <button
          @click="handleLogout"
          class="rounded-full border px-5 py-3 text-sm font-bold hover:bg-black hover:text-white transition"
        >
          Déconnexion
        </button>
      </div>

      <div class="grid gap-6 md:grid-cols-2">
        <router-link
          to="/admin/products"
          class="rounded-2xl bg-white p-6 shadow-sm hover:-translate-y-1 transition"
        >
          <h2 class="text-xl font-bold">Produits</h2>
          <p class="text-sm text-zinc-500 mt-2">
            Gérer les produits
          </p>
        </router-link>

        <div class="rounded-2xl bg-white p-6 shadow-sm">
          <h2 class="text-xl font-bold">Statistiques</h2>
          <p class="text-sm text-zinc-500 mt-2">
            (à venir)
          </p>
        </div>
      </div>
    </div>
  </main>
</template>