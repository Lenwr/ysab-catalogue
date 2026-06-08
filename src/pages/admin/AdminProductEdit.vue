<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { supabase } from "../../lib/supabase";
import {
  removeProductImageByUrl,
  uploadProductImage,
} from "../../lib/productStorage";
import AdminProductForm from "./AdminProductForm.vue";

const route = useRoute();
const router = useRouter();

const product = ref(null);
const loading = ref(false);
const pageLoading = ref(true);
const errorMessage = ref("");

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function loadProduct() {
  pageLoading.value = true;
  errorMessage.value = "";

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", route.params.id)
    .single();

  if (error || !data) {
    errorMessage.value = "Produit introuvable.";
    product.value = null;
  } else {
    product.value = data;
  }

  pageLoading.value = false;
}

async function handleUpdateProduct(payload) {
  if (!product.value) return;

  errorMessage.value = "";
  loading.value = true;
  let uploadedImageUrl = null;

  try {
    const previousImageUrl = product.value.cover_image_url || null;
    let imageUrl = previousImageUrl;

    if (payload.image) {
      uploadedImageUrl = await uploadProductImage("covers", payload.image);
      imageUrl = uploadedImageUrl;
    }

    const { error } = await supabase
      .from("products")
      .update({
        name: payload.name,
        slug: slugify(payload.slug || payload.name),
        reference: payload.reference || null,
        description: payload.description || null,
        category: payload.category,
        color: payload.color || null,
        pattern: payload.pattern || null,
        cover_image_url: imageUrl,
        is_featured: payload.is_featured,
        is_available: payload.is_available,
      })
      .eq("id", product.value.id);

    if (error) {
      throw new Error(error.message || "Erreur mise à jour produit");
    }

    if (uploadedImageUrl && previousImageUrl) {
      await removeProductImageByUrl(previousImageUrl);
    }

    router.push("/admin/products");
  } catch (error) {
    if (uploadedImageUrl) {
      await removeProductImageByUrl(uploadedImageUrl);
    }

    errorMessage.value =
      error instanceof Error ? error.message : "Erreur mise à jour produit";
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadProduct();
});
</script>

<template>
  <main class="min-h-screen bg-[#f7f2ea] px-6 py-10">
    <div class="mx-auto max-w-5xl">
      <div class="mb-8">
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
          Admin
        </p>
        <h1 class="mt-3 text-3xl font-bold">Modifier le produit</h1>
        <p class="mt-2 text-sm text-zinc-600">
          Mets à jour les informations du pagne.
        </p>
      </div>

      <div v-if="pageLoading" class="rounded-2xl border border-zinc-200 bg-white p-6">
        Chargement...
      </div>

      <div
        v-else-if="errorMessage && !product"
        class="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
      >
        {{ errorMessage }}
      </div>

      <template v-else-if="product">
        <div
          v-if="errorMessage"
          class="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {{ errorMessage }}
        </div>

        <AdminProductForm
          :initial-data="product"
          :loading="loading"
          submit-label="Mettre à jour le produit"
          @submit="handleUpdateProduct"
        />
      </template>
    </div>
  </main>
</template>
