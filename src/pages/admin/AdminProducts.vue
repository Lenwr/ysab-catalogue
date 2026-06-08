<script setup>
import { onMounted, ref } from "vue";
import { supabase } from "../../lib/supabase";
import { removeProductImagesByUrls } from "../../lib/productStorage";

const products = ref([]);
const loading = ref(true);
const errorMessage = ref("");
const deletingId = ref(null);
const productToDelete = ref(null);

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
      created_at,
      product_variants (
        image_url
      )
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

function openDeleteModal(product) {
  productToDelete.value = product;
}

function closeDeleteModal() {
  if (deletingId.value) return;
  productToDelete.value = null;
}

async function handleDelete() {
  if (!productToDelete.value) return;

  const productId = productToDelete.value.id;
  deletingId.value = productId;
  const product = productToDelete.value;

  const { error } = await supabase.from("products").delete().eq("id", productId);

  if (error) {
    errorMessage.value = error.message || "Erreur suppression produit.";
    deletingId.value = null;
    return;
  }

  products.value = products.value.filter((product) => product.id !== productId);
  await removeProductImagesByUrls([
    product?.cover_image_url,
    ...(product?.product_variants || []).map((variant) => variant.image_url),
  ]);
  productToDelete.value = null;
  deletingId.value = null;
}

onMounted(() => {
  loadProducts();
});
</script>

<template>
  <main class="min-h-screen bg-zinc-50 px-4 py-8 sm:px-6">
    <div class="mx-auto max-w-7xl">
      <div class="mb-6 flex flex-col gap-4 border-b border-zinc-200 pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">Produits</h1>
          <p class="mt-2 text-sm text-zinc-500">
            Liste de tous les produits du catalogue.
          </p>
        </div>

        <router-link
          to="/admin/products/new"
          class="rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
        >
          Ajouter un produit
        </router-link>
      </div>

      <div
        v-if="errorMessage"
        class="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
      >
        {{ errorMessage }}
      </div>

      <div v-if="loading" class="rounded-xl border border-zinc-200 bg-white p-6">
        <p class="text-sm text-zinc-500">Chargement...</p>
      </div>

      <div v-else-if="!products.length" class="rounded-xl border border-zinc-200 bg-white p-6">
        <p class="text-sm text-zinc-500">Aucun produit trouvé.</p>
      </div>

      <div v-else class="overflow-hidden rounded-xl border border-zinc-200 bg-white">
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead class="bg-zinc-100/70 text-left">
              <tr class="border-b">
                <th class="px-4 py-3 text-xs font-bold uppercase tracking-wide text-zinc-500">Image</th>
                <th class="px-4 py-3 text-xs font-bold uppercase tracking-wide text-zinc-500">Nom</th>
                <th class="px-4 py-3 text-xs font-bold uppercase tracking-wide text-zinc-500">Catégorie</th>
                <th class="px-4 py-3 text-xs font-bold uppercase tracking-wide text-zinc-500">Couleur</th>
                <th class="px-4 py-3 text-xs font-bold uppercase tracking-wide text-zinc-500">Statut</th>
                <th class="px-4 py-3 text-xs font-bold uppercase tracking-wide text-zinc-500">Vedette</th>
                <th class="px-4 py-3 text-xs font-bold uppercase tracking-wide text-zinc-500">Créé le</th>
                <th class="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-zinc-500">Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="product in products"
                :key="product.id"
                class="border-b last:border-0"
              >
                <td class="px-4 py-4">
                  <div class="h-14 w-14 overflow-hidden rounded-lg bg-zinc-100">
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
                  <div class="font-semibold text-zinc-950">{{ product.name }}</div>
                  <div class="text-xs text-zinc-500">{{ product.slug }}</div>
                </td>

                <td class="px-4 py-4">{{ product.category }}</td>
                <td class="px-4 py-4">{{ product.color || "-" }}</td>
                <td class="px-4 py-4">
                  <span
                    class="rounded-full px-2.5 py-1 text-xs font-semibold"
                    :class="
                      product.is_available
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-zinc-100 text-zinc-600'
                    "
                  >
                    {{ product.is_available ? "Disponible" : "Indisponible" }}
                  </span>
                </td>
                <td class="px-4 py-4">
                  <span
                    class="rounded-full px-2.5 py-1 text-xs font-semibold"
                    :class="
                      product.is_featured
                        ? 'bg-black text-white'
                        : 'bg-zinc-100 text-zinc-500'
                    "
                  >
                    {{ product.is_featured ? "Oui" : "Non" }}
                  </span>
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
                      class="rounded-lg border border-zinc-300 px-3 py-2 text-xs font-semibold hover:bg-zinc-50"
                    >
                      Variantes
                    </router-link>

                    <router-link
                      :to="`/admin/products/${product.id}/edit`"
                      class="rounded-lg border border-zinc-300 px-3 py-2 text-xs font-semibold hover:bg-zinc-50"
                    >
                      Modifier
                    </router-link>

                    <button
                      type="button"
                      :disabled="deletingId === product.id"
                      @click="openDeleteModal(product)"
                      class="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
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

      <div
        v-if="productToDelete"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      >
        <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
          <h2 class="text-xl font-bold">Supprimer le produit</h2>

          <p class="mt-3 text-sm leading-6 text-zinc-600">
            Tu vas supprimer
            <span class="font-semibold text-zinc-900">{{ productToDelete.name }}</span>,
            ses variantes et ses images associées. Cette action est définitive.
          </p>

          <div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              :disabled="Boolean(deletingId)"
              class="rounded-xl border border-zinc-300 px-5 py-3 text-sm font-semibold disabled:opacity-50"
              @click="closeDeleteModal"
            >
              Annuler
            </button>

            <button
              type="button"
              :disabled="Boolean(deletingId)"
              class="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
              @click="handleDelete"
            >
              {{ deletingId ? "Suppression..." : "Supprimer" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
