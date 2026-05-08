<script setup>
import { onMounted, ref } from "vue";
import { supabase } from "../../lib/supabase";

const products = ref([]);
const loading = ref(true);
const errorMessage = ref("");
const deletingId = ref(null);

async function loadProducts() {
  loading.value = true;
  errorMessage.value = "";

  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      category,
      color,
      cover_image_url,
      is_featured,
      is_available,
      created_at
    `)
    .order("created_at", { ascending: false });

  if (error) {
    errorMessage.value = "Erreur lors du chargement des produits.";
    products.value = [];
  } else {
    products.value = data || [];
  }

  loading.value = false;
}

async function handleDelete(productId) {
  const confirmed = window.confirm("Supprimer ce produit ?");
  if (!confirmed) return;

  deletingId.value = productId;

  const { error } = await supabase.from("products").delete().eq("id", productId);

  if (error) {
    errorMessage.value = error.message || "Erreur suppression produit.";
    deletingId.value = null;
    return;
  }

  products.value = products.value.filter((product) => product.id !== productId);
  deletingId.value = null;
}

onMounted(() => {
  loadProducts();
});
</script>

<template>
  <main class="min-h-screen bg-white px-6 py-10">
    <div class="mx-auto max-w-7xl">
      <div class="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 class="text-3xl font-bold">Produits</h1>
          <p class="mt-2 text-sm text-zinc-500">
            Liste de tous les produits du catalogue.
          </p>
        </div>

        <router-link
          to="/admin/products/new"
          class="rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white"
        >
          Ajouter un produit
        </router-link>
      </div>

      <div
        v-if="errorMessage"
        class="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
      >
        {{ errorMessage }}
      </div>

      <div v-if="loading" class="rounded-2xl border bg-white p-6 shadow-sm">
        <p class="text-sm text-zinc-500">Chargement...</p>
      </div>

      <div v-else-if="!products.length" class="rounded-2xl border bg-white p-6 shadow-sm">
        <p class="text-sm text-zinc-500">Aucun produit trouvé.</p>
      </div>

      <div v-else class="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead class="bg-zinc-50 text-left">
              <tr class="border-b">
                <th class="px-4 py-3 font-semibold">Image</th>
                <th class="px-4 py-3 font-semibold">Nom</th>
                <th class="px-4 py-3 font-semibold">Catégorie</th>
                <th class="px-4 py-3 font-semibold">Couleur</th>
                <th class="px-4 py-3 font-semibold">Statut</th>
                <th class="px-4 py-3 font-semibold">Vedette</th>
                <th class="px-4 py-3 font-semibold">Créé le</th>
                <th class="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="product in products"
                :key="product.id"
                class="border-b last:border-0"
              >
                <td class="px-4 py-4">
                  <div class="h-16 w-16 overflow-hidden rounded-lg bg-zinc-100">
                    <img
                      v-if="product.cover_image_url"
                      :src="product.cover_image_url"
                      :alt="product.name"
                      class="h-full w-full object-cover"
                    />
                    <div
                      v-else
                      class="flex h-full items-center justify-center text-xs text-zinc-400"
                    >
                      N/A
                    </div>
                  </div>
                </td>

                <td class="px-4 py-4">
                  <div class="font-medium">{{ product.name }}</div>
                  <div class="text-xs text-zinc-500">{{ product.slug }}</div>
                </td>

                <td class="px-4 py-4">{{ product.category }}</td>
                <td class="px-4 py-4">{{ product.color || "-" }}</td>
                <td class="px-4 py-4">
                  {{ product.is_available ? "Disponible" : "Indisponible" }}
                </td>
                <td class="px-4 py-4">
                  {{ product.is_featured ? "Oui" : "Non" }}
                </td>
                <td class="px-4 py-4">
                  {{
                    product.created_at
                      ? new Date(product.created_at).toLocaleDateString("fr-FR")
                      : "-"
                  }}
                </td>

                <td class="px-4 py-4">
                  <div class="flex items-center justify-end gap-2">
                    <router-link
                      :to="`/admin/products/${product.id}/variants`"
                      class="rounded-lg border px-3 py-2 text-xs font-medium hover:bg-zinc-50"
                    >
                      Variantes
                    </router-link>

                    <router-link
                      :to="`/admin/products/${product.id}/edit`"
                      class="rounded-lg border px-3 py-2 text-xs font-medium hover:bg-zinc-50"
                    >
                      Modifier
                    </router-link>

                    <button
                      type="button"
                      :disabled="deletingId === product.id"
                      @click="handleDelete(product.id)"
                      class="rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-60"
                    >
                      {{ deletingId === product.id ? "Suppression..." : "Supprimer" }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </main>
</template>