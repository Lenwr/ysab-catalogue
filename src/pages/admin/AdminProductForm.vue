<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  initialData: {
    type: Object,
    default: null,
  },
  submitLabel: {
    type: String,
    default: "Créer le produit",
  },
  colors: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["submit"]);

const form = ref({
  name: props.initialData?.name || "",
  slug: props.initialData?.slug || "",
  reference: props.initialData?.reference || "",
  description: props.initialData?.description || "",
  category: props.initialData?.category || "",
  color: props.initialData?.color || "",
  pattern: props.initialData?.pattern || "",
  is_featured: props.initialData?.is_featured ?? false,
  is_available: props.initialData?.is_available ?? true,
});

const imageFile = ref(null);
const imagePreview = ref(props.initialData?.cover_image_url || "");

watch(
  () => props.initialData,
  (value) => {
    if (!value) return;

    form.value = {
      name: value.name || "",
      slug: value.slug || "",
      reference: value.reference || "",
      description: value.description || "",
      category: value.category || "",
      color: value.color || "",
      pattern: value.pattern || "",
      is_featured: value.is_featured ?? false,
      is_available: value.is_available ?? true,
    };

    imagePreview.value = value.cover_image_url || "";
  },
  { immediate: true }
);

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

watch(
  () => form.value.name,
  (value) => {
    if (
      !props.initialData &&
      (!form.value.slug || form.value.slug === slugify(form.value.slug))
    ) {
      form.value.slug = slugify(value);
    }
  }
);

function handleImageChange(event) {
  const file = event.target.files?.[0] || null;
  imageFile.value = file;

  if (!file) return;

  imagePreview.value = URL.createObjectURL(file);
}

function handleSubmit() {
  emit("submit", {
    ...form.value,
    image: imageFile.value,
  });
}
</script>

<template>
  <form class="space-y-8" @submit.prevent="handleSubmit">
    <!-- INFOS PRODUIT -->
    <div class="rounded-[2rem] border border-zinc-200 bg-white p-6">
      <h2 class="text-lg font-bold">Informations produit</h2>

      <div class="mt-6 grid gap-5 md:grid-cols-2">
        <!-- NOM -->
        <div>
          <label class="mb-2 block text-sm font-medium">
            Nom
          </label>

          <input
            v-model="form.name"
            type="text"
            required
            class="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none transition focus:border-black"
            placeholder="Ex: Super Wax Fleur"
          />
        </div>

        <!-- SLUG -->
        <div>
          <label class="mb-2 block text-sm font-medium">
            Slug
          </label>

          <input
            v-model="form.slug"
            type="text"
            required
            class="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none transition focus:border-black"
            placeholder="super-wax-fleur"
          />
        </div>

        <!-- REFERENCE -->
        <div>
          <label class="mb-2 block text-sm font-medium">
            Référence
          </label>

          <input
            v-model="form.reference"
            type="text"
            class="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none transition focus:border-black"
            placeholder="REF-001"
          />
        </div>

        <!-- CATEGORIE -->
        <div>
          <label class="mb-2 block text-sm font-medium">
            Catégorie
          </label>

          <select
            v-model="form.category"
            required
            class="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 outline-none transition focus:border-black"
          >
            <option value="">
              Choisir une catégorie
            </option>

            <option value="Wax Hollandais">
              Wax Hollandais
            </option>

            <option value="Super Wax">
              Super Wax
            </option>

            <option value="Grand Super-Wax">
              Grand Super-Wax
            </option>
          </select>
        </div>

        <!-- COULEUR -->
        <div>
          <label class="mb-2 block text-sm font-medium">
            Couleur principale
          </label>

          <input
            v-model="form.color"
            list="color-options"
            type="text"
            class="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none transition focus:border-black"
            placeholder="Bleu, Rouge, Vert..."
          />

          <datalist id="color-options">
            <option
              v-for="color in colors"
              :key="color"
              :value="color"
            />
          </datalist>

          <p class="mt-1 text-xs text-zinc-500">
            Tu peux choisir ou écrire une nouvelle couleur.
          </p>
        </div>

        <!-- MOTIF -->
        <div>
          <label class="mb-2 block text-sm font-medium">
            Motif
          </label>

          <input
            v-model="form.pattern"
            type="text"
            class="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none transition focus:border-black"
            placeholder="Floral, Géométrique..."
          />
        </div>
      </div>

      <!-- DESCRIPTION -->
      <div class="mt-5">
        <label class="mb-2 block text-sm font-medium">
          Description
        </label>

        <textarea
          v-model="form.description"
          rows="5"
          class="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none transition focus:border-black"
          placeholder="Description du pagne..."
        />
      </div>
    </div>

    <!-- IMAGE -->
    <div class="rounded-[2rem] border border-zinc-200 bg-white p-6">
      <h2 class="text-lg font-bold">Image principale</h2>

      <div class="mt-5">
        <label class="mb-2 block text-sm font-medium">
          Choisir une image
        </label>

        <input
          type="file"
          accept="image/*"
          class="block w-full text-sm"
          @change="handleImageChange"
        />
      </div>

      <div
        v-if="imagePreview"
        class="mt-5 overflow-hidden rounded-[1.5rem] border border-zinc-200 bg-zinc-50"
      >
        <img
          :src="imagePreview"
          alt="Aperçu"
          class="h-80 w-full object-cover"
        />
      </div>
    </div>

    <!-- VISIBILITE -->
    <div class="rounded-[2rem] border border-zinc-200 bg-white p-6">
      <h2 class="text-lg font-bold">Visibilité</h2>

      <div class="mt-5 flex flex-col gap-4">
        <label class="flex items-center gap-3 text-sm">
          <input
            v-model="form.is_featured"
            type="checkbox"
          />

          Mettre ce pagne en vedette
        </label>

        <label class="flex items-center gap-3 text-sm">
          <input
            v-model="form.is_available"
            type="checkbox"
          />

          Produit disponible
        </label>
      </div>
    </div>

    <!-- SUBMIT -->
    <div class="flex justify-end">
      <button
        type="submit"
        :disabled="loading"
        class="inline-flex items-center justify-center rounded-full bg-black px-7 py-4 text-sm font-bold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {{ loading ? "Enregistrement..." : submitLabel }}
      </button>
    </div>
  </form>
</template>