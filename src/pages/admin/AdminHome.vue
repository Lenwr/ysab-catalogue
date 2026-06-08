<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "../../lib/supabase";

const router = useRouter();
const userEmail = ref("");
const loadingStats = ref(true);
const stats = ref({
  total: 0,
  available: 0,
  unavailable: 0,
  featured: 0,
  variants: 0,
});
const recentProducts = ref([]);

async function countRows(table, filters = []) {
  let query = supabase.from(table).select("*", { count: "exact", head: true });

  for (const filter of filters) {
    query = query.eq(filter.column, filter.value);
  }

  const { count } = await query;
  return count || 0;
}

async function loadStats() {
  loadingStats.value = true;

  const [
    total,
    available,
    unavailable,
    featured,
    variants,
    recentResult,
  ] = await Promise.all([
    countRows("products"),
    countRows("products", [{ column: "is_available", value: true }]),
    countRows("products", [{ column: "is_available", value: false }]),
    countRows("products", [{ column: "is_featured", value: true }]),
    countRows("product_variants"),
    supabase
      .from("products")
      .select("id, name, slug, category, is_available, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  stats.value = {
    total,
    available,
    unavailable,
    featured,
    variants,
  };
  recentProducts.value = recentResult.data || [];
  loadingStats.value = false;
}

onMounted(async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  userEmail.value = user?.email || "";
  await loadStats();
});

async function handleLogout() {
  await supabase.auth.signOut();
  router.push("/login");
}
</script>

<template>
  <main class="min-h-screen bg-zinc-50 px-4 py-8 sm:px-6">
    <div class="mx-auto max-w-6xl">
      <div class="mb-6 flex flex-col gap-4 border-b border-zinc-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.24em] text-zinc-500">
            Dashboard
          </p>

          <h1 class="mt-2 text-3xl font-bold tracking-tight">
            Admin YSAB
          </h1>

          <p class="mt-2 text-sm text-zinc-600">
            Connecté : {{ userEmail }}
          </p>
        </div>

        <button
          @click="handleLogout"
          class="rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-bold transition hover:border-black hover:bg-black hover:text-white"
        >
          Déconnexion
        </button>
      </div>

      <div class="grid gap-4 lg:grid-cols-[280px_1fr]">
        <router-link
          to="/admin/products"
          class="rounded-xl border border-zinc-200 bg-white p-5 transition hover:border-zinc-400"
        >
          <h2 class="text-xl font-bold">Produits</h2>
          <p class="mt-2 text-sm text-zinc-500">
            Gérer les produits
          </p>
        </router-link>

        <div class="rounded-xl border border-zinc-200 bg-white p-5">
          <div class="flex items-center justify-between gap-4">
            <h2 class="text-xl font-bold">Statistiques</h2>
            <button
              type="button"
              class="rounded-lg border border-zinc-300 px-3 py-2 text-xs font-bold uppercase tracking-wide text-zinc-500 hover:bg-zinc-50"
              @click="loadStats"
            >
              Actualiser
            </button>
          </div>

          <div v-if="loadingStats" class="mt-5 text-sm text-zinc-500">
            Chargement des statistiques...
          </div>

          <div v-else class="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <div class="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4">
              <p class="text-2xl font-bold">{{ stats.total }}</p>
              <p class="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Produits
              </p>
            </div>

            <div class="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4">
              <p class="text-2xl font-bold">{{ stats.available }}</p>
              <p class="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Disponibles
              </p>
            </div>

            <div class="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4">
              <p class="text-2xl font-bold">{{ stats.unavailable }}</p>
              <p class="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Indisponibles
              </p>
            </div>

            <div class="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4">
              <p class="text-2xl font-bold">{{ stats.featured }}</p>
              <p class="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Vedette
              </p>
            </div>

            <div class="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4">
              <p class="text-2xl font-bold">{{ stats.variants }}</p>
              <p class="mt-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Variantes
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-4 rounded-xl border border-zinc-200 bg-white p-5">
        <div class="mb-5 flex items-center justify-between gap-4">
          <h2 class="text-xl font-bold">Derniers produits</h2>
          <router-link
            to="/admin/products"
            class="rounded-lg border border-zinc-300 px-3 py-2 text-xs font-bold uppercase tracking-wide text-zinc-500 hover:bg-zinc-50"
          >
            Voir tout
          </router-link>
        </div>

        <div v-if="!recentProducts.length" class="text-sm text-zinc-500">
          Aucun produit pour le moment.
        </div>

        <div v-else class="divide-y divide-zinc-100">
          <div
            v-for="product in recentProducts"
            :key="product.id"
            class="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p class="font-semibold">{{ product.name }}</p>
              <p class="mt-1 text-sm text-zinc-500">
                {{ product.category || "Sans catégorie" }} ·
                {{ product.is_available ? "Disponible" : "Indisponible" }}
              </p>
            </div>

            <router-link
              :to="`/admin/products/${product.id}/edit`"
              class="text-sm font-semibold text-zinc-600 hover:text-black"
            >
              Modifier
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
