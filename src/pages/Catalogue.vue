<script setup>
import { ref, watch, onMounted } from "vue";
import { supabase } from "../lib/supabase";
import ProductCard from "../components/ProductCard.vue";

const products = ref([]);
const loading = ref(true);
const errorMessage = ref("");
const totalCount = ref(0);

const searchQuery = ref("");
const selectedCategory = ref("");
const selectedColor = ref("");
const selectedPattern = ref("");
const currentPage = ref(1);
const pageSize = 12;

const categories = ref([]);
const colors = ref([]);
const patterns = ref([]);

function sanitizeSearch(value) {
  return value.trim().replace(/[%_,]/g, " ");
}

async function loadFilterOptions() {
  const { data } = await supabase
    .from("products")
    .select("category, color, pattern")
    .eq("is_available", true);

  const items = data || [];

  categories.value = [
    ...new Set(items.map((product) => product.category).filter(Boolean)),
  ].sort();

  colors.value = [
    ...new Set(items.map((product) => product.color).filter(Boolean)),
  ].sort();

  patterns.value = [
    ...new Set(items.map((product) => product.pattern).filter(Boolean)),
  ].sort();
}

async function loadProducts() {
  loading.value = true;
  errorMessage.value = "";

  const from = (currentPage.value - 1) * pageSize;
  const to = from + pageSize - 1;
  const search = sanitizeSearch(searchQuery.value);

  let query = supabase
    .from("products")
    .select(
      `
      id,
      name,
      slug,
      reference,
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
    `,
      { count: "exact" }
    )
    .eq("is_available", true);

  if (selectedCategory.value) {
    query = query.eq("category", selectedCategory.value);
  }

  if (selectedColor.value) {
    query = query.eq("color", selectedColor.value);
  }

  if (selectedPattern.value) {
    query = query.eq("pattern", selectedPattern.value);
  }

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,reference.ilike.%${search}%,color.ilike.%${search}%,pattern.ilike.%${search}%`
    );
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    errorMessage.value = "Erreur lors du chargement des produits.";
    products.value = [];
    totalCount.value = 0;
    loading.value = false;
    return;
  }

  products.value = data || [];
  totalCount.value = count || 0;
  loading.value = false;
}

function clearFilters() {
  searchQuery.value = "";
  selectedCategory.value = "";
  selectedColor.value = "";
  selectedPattern.value = "";
  currentPage.value = 1;
}

function nextPage() {
  if (currentPage.value * pageSize >= totalCount.value) return;
  currentPage.value += 1;
}

function previousPage() {
  if (currentPage.value === 1) return;
  currentPage.value -= 1;
}

watch(
  [searchQuery, selectedCategory, selectedColor, selectedPattern],
  () => {
    currentPage.value = 1;
    loadProducts();
  },
  { flush: "post" }
);

watch(currentPage, () => {
  loadProducts();
});

onMounted(async () => {
  await loadFilterOptions();
  await loadProducts();
});
</script>

<template>
  <main class="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:py-8">
    <div class="mb-8 border-b border-zinc-200 pb-5">
      <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <label class="mb-2 block text-xs font-bold uppercase tracking-wide text-zinc-500">
            Recherche
          </label>
          <input
            v-model="searchQuery"
            type="search"
            class="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none transition focus:border-black"
            placeholder="Nom, référence, couleur..."
          />
        </div>

        <div>
          <label class="mb-2 block text-xs font-bold uppercase tracking-wide text-zinc-500">
            Catégorie
          </label>
          <select
            v-model="selectedCategory"
            class="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none transition focus:border-black"
          >
            <option value="">Toutes les catégories</option>
            <option v-for="cat in categories" :key="cat" :value="cat">
              {{ cat }}
            </option>
          </select>
        </div>

        <div>
          <label class="mb-2 block text-xs font-bold uppercase tracking-wide text-zinc-500">
            Couleur
          </label>
          <select
            v-model="selectedColor"
            class="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none transition focus:border-black"
          >
            <option value="">Toutes les couleurs</option>
            <option v-for="color in colors" :key="color" :value="color">
              {{ color }}
            </option>
          </select>
        </div>

        <div>
          <label class="mb-2 block text-xs font-bold uppercase tracking-wide text-zinc-500">
            Motif
          </label>
          <select
            v-model="selectedPattern"
            class="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm outline-none transition focus:border-black"
          >
            <option value="">Tous les motifs</option>
            <option v-for="pattern in patterns" :key="pattern" :value="pattern">
              {{ pattern }}
            </option>
          </select>
        </div>
      </div>

      <div class="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          {{ totalCount }} résultats
        </p>

        <button
          type="button"
          class="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold transition hover:border-black hover:bg-zinc-50"
          @click="clearFilters"
        >
          Réinitialiser
        </button>
      </div>
    </div>

    <div
      v-if="loading"
      class="rounded-xl border bg-white p-8 text-center"
    >
      Chargement...
    </div>

    <div
      v-else-if="errorMessage"
      class="rounded-xl border bg-white p-8 text-center"
    >
      {{ errorMessage }}
    </div>

    <div
      v-else-if="products.length === 0"
      class="rounded-xl border bg-white p-8 text-center"
    >
      Aucun produit trouvé.
    </div>

    <div
      v-else
      class="grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
      />
    </div>

    <div
      v-if="!loading && totalCount > pageSize"
      class="mt-10 flex flex-col gap-3 border-t border-zinc-200 pt-6 sm:flex-row sm:items-center sm:justify-between"
    >
      <p class="text-sm text-zinc-500">
        Page {{ currentPage }} sur {{ Math.ceil(totalCount / pageSize) }}
      </p>

      <div class="flex gap-3">
        <button
          type="button"
          :disabled="currentPage === 1"
          class="rounded-full border border-zinc-300 px-5 py-3 text-sm font-semibold transition hover:border-black disabled:cursor-not-allowed disabled:opacity-40"
          @click="previousPage"
        >
          Précédent
        </button>

        <button
          type="button"
          :disabled="currentPage * pageSize >= totalCount"
          class="rounded-full bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
          @click="nextPage"
        >
          Suivant
        </button>
      </div>
    </div>
  </main>
</template>
