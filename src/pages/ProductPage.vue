<script setup>
import { onMounted, ref } from "vue";
import { useRoute, RouterLink } from "vue-router";
import { supabase } from "../lib/supabase";
import ProductDetailView from "../components/ProductDetailView.vue";

const route = useRoute();
const product = ref(null);
const loading = ref(true);
const notFound = ref(false);

onMounted(async () => {
  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      reference,
      category,
      pattern,
      description,
      color,
      cover_image_url,
      is_available,
      is_featured,
      product_variants (
        id,
        color_name,
        image_url,
        is_default
      )
    `)
    .eq("slug", route.params.slug)
    .eq("is_available", true)
    .single();

  if (error || !data) {
    notFound.value = true;
  } else {
    product.value = data;
  }

  loading.value = false;
});
</script>

<template>
  <main class="mx-auto max-w-6xl px-4 py-10">
    <RouterLink
      to="/catalogue"
      class="mb-8 inline-flex text-sm font-medium text-zinc-600 hover:text-zinc-900"
    >
      ← Retour au catalogue
    </RouterLink>

    <div v-if="loading">Chargement...</div>

    <div v-else-if="notFound">Produit introuvable.</div>

    <ProductDetailView v-else :product="product" />
  </main>
</template>
