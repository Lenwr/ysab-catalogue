<script setup>
import { ref, computed, onMounted } from "vue";
import { supabase } from "../lib/supabase";
import ProductCard from "../components/ProductCard.vue";


const products = ref([]);
const loading = ref(true);
const errorMessage = ref("");

const selectedCategory = ref("");
const selectedColor = ref("");
const selectedPattern = ref("");

const categories = ref([]);
const colors = ref([]);
const patterns = ref([]);

onMounted(async () => {
  loading.value = true;
  errorMessage.value = "";

  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      category,
      pattern,
      color,
      cover_image_url,
      is_featured,
      is_available,
      product_variants (
        id,
        color_name,
        image_url,
        is_default
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    errorMessage.value = "Erreur lors du chargement des produits.";
    products.value = [];
    loading.value = false;
    return;
  }

  products.value = data || [];

  categories.value = [
    ...new Set(products.value.map((product) => product.category).filter(Boolean)),
  ];

  colors.value = [
    ...new Set(products.value.map((product) => product.color).filter(Boolean)),
  ];

  patterns.value = [
    ...new Set(products.value.map((product) => product.pattern).filter(Boolean)),
  ];

  loading.value = false;
});

function clearFilters() {
  selectedCategory.value = "";
  selectedColor.value = "";
  selectedPattern.value = "";
}

const filteredProducts = computed(() => {
  return products.value.filter((product) => {
    const matchCategory =
      !selectedCategory.value || product.category === selectedCategory.value;

    const matchColor =
      !selectedColor.value || product.color === selectedColor.value;

    const matchPattern =
      !selectedPattern.value || product.pattern === selectedPattern.value;

    return matchCategory && matchColor && matchPattern;
  });
});
</script>

<template>
  <main class="mx-auto max-w-[1600px] px-6 py-8">
 
    <div class="mb-8 flex flex-col gap-4 rounded-3xl border border-zinc-200 bg-white p-6 lg:flex-row lg:items-end lg:justify-between">
      <div class="grid gap-4 md:grid-cols-3 lg:flex-1">
        <div>
          <label class="mb-2 block text-sm font-semibold">Catégorie</label>
          <select
            v-model="selectedCategory"
            class="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 outline-none focus:border-black"
          >
            <option value="">Toutes les catégories</option>
            <option v-for="cat in categories" :key="cat" :value="cat">
              {{ cat }}
            </option>
          </select>
        </div>

        <div>
          <label class="mb-2 block text-sm font-semibold">Couleur</label>
          <select
            v-model="selectedColor"
            class="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 outline-none focus:border-black"
          >
            <option value="">Toutes les couleurs</option>
            <option v-for="color in colors" :key="color" :value="color">
              {{ color }}
            </option>
          </select>
        </div>

        <div>
          <label class="mb-2 block text-sm font-semibold">Motif</label>
          <select
            v-model="selectedPattern"
            class="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 outline-none focus:border-black"
          >
            <option value="">Tous les motifs</option>
            <option v-for="pattern in patterns" :key="pattern" :value="pattern">
              {{ pattern }}
            </option>
          </select>
        </div>
      </div>

      <div class="flex items-center justify-between gap-4 lg:justify-end">
        <p class="text-sm font-medium uppercase tracking-wide text-zinc-500">
          {{ filteredProducts.length }} résultats
        </p>

        <button
          type="button"
          class="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50"
          @click="clearFilters"
        >
          Réinitialiser
        </button>
      </div>
    </div>

    <div
      v-if="loading"
      class="rounded-2xl border bg-white p-8 text-center"
    >
      Chargement...
    </div>

    <div
      v-else-if="errorMessage"
      class="rounded-2xl border bg-white p-8 text-center"
    >
      {{ errorMessage }}
    </div>

    <div
      v-else-if="filteredProducts.length === 0"
      class="rounded-2xl border bg-white p-8 text-center"
    >
      Aucun produit trouvé.
    </div>

    <div
      v-else
      class="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <ProductCard
        v-for="product in filteredProducts"
        :key="product.id"
        :product="product"
      />
    </div>
  </main>
</template>