<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "../../lib/supabase";
import AdminProductForm from "./AdminProductForm.vue";

const router = useRouter();
const loading = ref(false);
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

async function uploadImage(file) {
  if (!file) return null;

  const fileExt = file.name.split(".").pop();
  const fileName = `covers/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("products")
    .upload(fileName, file, {
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message || "Erreur upload image");
  }

  const { data } = supabase.storage.from("products").getPublicUrl(fileName);

  return data.publicUrl;
}

async function handleCreateProduct(payload) {
  errorMessage.value = "";
  loading.value = true;

  try {
    const imageUrl = await uploadImage(payload.image);

    const { error } = await supabase.from("products").insert({
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
    });

    if (error) {
      throw new Error(error.message || "Erreur création produit");
    }

    router.push("/admin/products");
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : "Erreur création produit";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <main class="min-h-screen bg-[#f7f2ea] px-6 py-10">
    <div class="mx-auto max-w-5xl">
      <div class="mb-8">
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
          Admin
        </p>
        <h1 class="mt-3 text-3xl font-bold">Nouveau produit</h1>
        <p class="mt-2 text-sm text-zinc-600">
          Ajoute un nouveau pagne dans le catalogue.
        </p>
      </div>

      <div v-if="errorMessage" class="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {{ errorMessage }}
      </div>

      <AdminProductForm :loading="loading" @submit="handleCreateProduct" />
    </div>
  </main>
</template>