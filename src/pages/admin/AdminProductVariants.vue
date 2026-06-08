<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { supabase } from "../../lib/supabase";
import {
  removeProductImageByUrl,
  uploadProductImage,
} from "../../lib/productStorage";

const route = useRoute();

const product = ref(null);
const variants = ref([]);
const loading = ref(true);
const formLoading = ref(false);
const errorMessage = ref("");
const deletingId = ref(null);
const defaultingId = ref(null);

const newVariant = ref({
  color_name: "",
  is_default: false,
});

const imageFile = ref(null);
const imagePreview = ref("");

const productId = computed(() => route.params.id);

function handleImageChange(event) {
  const file = event.target.files?.[0] || null;
  imageFile.value = file;

  if (!file) {
    imagePreview.value = "";
    return;
  }

  imagePreview.value = URL.createObjectURL(file);
}

async function loadProductAndVariants() {
  loading.value = true;
  errorMessage.value = "";

  const { data: productData, error: productError } = await supabase
    .from("products")
    .select("id, name, slug, cover_image_url")
    .eq("id", productId.value)
    .single();

  if (productError || !productData) {
    errorMessage.value = "Produit introuvable.";
    loading.value = false;
    return;
  }

  product.value = productData;

  const { data: variantData, error: variantError } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", productId.value)
    .order("created_at", { ascending: false });

  if (variantError) {
    errorMessage.value = "Erreur lors du chargement des variantes.";
    variants.value = [];
  } else {
    variants.value = variantData || [];
  }

  loading.value = false;
}

async function handleCreateVariant() {
  errorMessage.value = "";

  if (!newVariant.value.color_name.trim()) {
    errorMessage.value = "Le nom de la couleur est obligatoire.";
    return;
  }

  if (!imageFile.value) {
    errorMessage.value = "L'image de la variante est obligatoire.";
    return;
  }

  formLoading.value = true;
  let imageUrl = null;

  try {
    imageUrl = await uploadProductImage("variants", imageFile.value);

    if (newVariant.value.is_default) {
      const { error: resetError } = await supabase
        .from("product_variants")
        .update({ is_default: false })
        .eq("product_id", productId.value);

      if (resetError) {
        throw new Error(resetError.message || "Erreur mise à jour variante");
      }
    }

    const { error } = await supabase.from("product_variants").insert({
      product_id: productId.value,
      color_name: newVariant.value.color_name.trim(),
      image_url: imageUrl,
      is_default: newVariant.value.is_default,
    });

    if (error) {
      throw new Error(error.message || "Erreur création variante");
    }

    newVariant.value = {
      color_name: "",
      is_default: false,
    };
    imageFile.value = null;
    imagePreview.value = "";

    await loadProductAndVariants();
  } catch (error) {
    if (imageUrl) {
      await removeProductImageByUrl(imageUrl);
    }

    errorMessage.value =
      error instanceof Error ? error.message : "Erreur création variante";
  } finally {
    formLoading.value = false;
  }
}

async function handleDeleteVariant(variantId) {
  const confirmed = window.confirm("Supprimer cette variante ?");
  if (!confirmed) return;

  deletingId.value = variantId;
  const variant = variants.value.find((item) => item.id === variantId);

  const { error } = await supabase
    .from("product_variants")
    .delete()
    .eq("id", variantId);

  if (error) {
    errorMessage.value = error.message || "Erreur suppression variante.";
    deletingId.value = null;
    return;
  }

  variants.value = variants.value.filter((variant) => variant.id !== variantId);
  await removeProductImageByUrl(variant?.image_url);
  deletingId.value = null;
}

async function handleSetDefault(variantId) {
  defaultingId.value = variantId;
  errorMessage.value = "";

  const { error: resetError } = await supabase
    .from("product_variants")
    .update({ is_default: false })
    .eq("product_id", productId.value);

  if (resetError) {
    errorMessage.value = resetError.message || "Erreur mise à jour variante.";
    defaultingId.value = null;
    return;
  }

  const { error } = await supabase
    .from("product_variants")
    .update({ is_default: true })
    .eq("id", variantId);

  if (error) {
    errorMessage.value = error.message || "Erreur mise à jour variante.";
    defaultingId.value = null;
    return;
  }

  await loadProductAndVariants();
  defaultingId.value = null;
}

onMounted(() => {
  loadProductAndVariants();
});
</script>

<template>
  <main class="min-h-screen bg-[#f7f2ea] px-6 py-10">
    <div class="mx-auto max-w-6xl">
      <div class="mb-8">
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
          Admin
        </p>
        <h1 class="mt-3 text-3xl font-bold">Variantes produit</h1>
        <p class="mt-2 text-sm text-zinc-600">
          Ajoute et gère les couleurs d’un pagne.
        </p>
      </div>

      <div
        v-if="errorMessage"
        class="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
      >
        {{ errorMessage }}
      </div>

      <div v-if="loading" class="rounded-2xl border border-zinc-200 bg-white p-6">
        Chargement...
      </div>

      <template v-else-if="product">
        <div class="mb-8 rounded-[2rem] border border-zinc-200 bg-white p-6">
          <div class="flex flex-col gap-5 md:flex-row md:items-center">
            <div class="h-24 w-24 overflow-hidden rounded-2xl bg-zinc-100">
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

            <div>
              <h2 class="text-2xl font-bold">{{ product.name }}</h2>
              <p class="mt-1 text-sm text-zinc-500">
                Produit : {{ product.slug }}
              </p>
            </div>
          </div>
        </div>

        <div class="grid gap-8 lg:grid-cols-[420px_minmax(0,1fr)]">
          <div class="rounded-[2rem] border border-zinc-200 bg-white p-6">
            <h2 class="text-lg font-bold">Ajouter une variante</h2>

            <div class="mt-5 space-y-5">
              <div>
                <label class="mb-2 block text-sm font-medium">Nom de couleur</label>
                <input
                  v-model="newVariant.color_name"
                  type="text"
                  placeholder="Ex: Bleu Rouge"
                  class="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none transition focus:border-black"
                />
              </div>

              <div>
                <label class="mb-2 block text-sm font-medium">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  class="block w-full text-sm"
                  @change="handleImageChange"
                />
              </div>

              <div
                v-if="imagePreview"
                class="overflow-hidden rounded-[1.5rem] border border-zinc-200 bg-zinc-50"
              >
                <img :src="imagePreview" alt="Aperçu" class="h-72 w-full object-cover" />
              </div>

              <label class="flex items-center gap-3 text-sm">
                <input v-model="newVariant.is_default" type="checkbox" />
                Définir comme variante par défaut
              </label>

              <button
                type="button"
                :disabled="formLoading"
                @click="handleCreateVariant"
                class="inline-flex w-full items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-bold text-white transition hover:bg-zinc-800 disabled:opacity-60"
              >
                {{ formLoading ? "Ajout..." : "Ajouter la variante" }}
              </button>
            </div>
          </div>

          <div class="rounded-[2rem] border border-zinc-200 bg-white p-6">
            <h2 class="text-lg font-bold">Variantes existantes</h2>

            <div v-if="!variants.length" class="mt-5 text-sm text-zinc-500">
              Aucune variante pour le moment.
            </div>

            <div v-else class="mt-5 space-y-4">
              <div
                v-for="variant in variants"
                :key="variant.id"
                class="flex flex-col gap-4 rounded-[1.5rem] border border-zinc-200 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div class="flex items-center gap-4">
                  <div class="h-20 w-20 overflow-hidden rounded-xl bg-zinc-100">
                    <img
                      :src="variant.image_url"
                      :alt="variant.color_name"
                      class="h-full w-full object-cover"
                    />
                  </div>

                  <div>
                    <h3 class="font-semibold">{{ variant.color_name }}</h3>
                    <p class="mt-1 text-sm text-zinc-500">
                      {{ variant.is_default ? "Variante par défaut" : "Variante standard" }}
                    </p>
                  </div>
                </div>

                <div class="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    :disabled="variant.is_default || defaultingId === variant.id"
                    @click="handleSetDefault(variant.id)"
                    class="rounded-lg border px-3 py-2 text-xs font-medium hover:bg-zinc-50 disabled:opacity-60"
                  >
                    {{
                      variant.is_default
                        ? "Par défaut"
                        : defaultingId === variant.id
                        ? "Mise à jour..."
                        : "Définir par défaut"
                    }}
                  </button>

                  <button
                    type="button"
                    :disabled="deletingId === variant.id"
                    @click="handleDeleteVariant(variant.id)"
                    class="rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-60"
                  >
                    {{
                      deletingId === variant.id ? "Suppression..." : "Supprimer"
                    }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </main>
</template>
