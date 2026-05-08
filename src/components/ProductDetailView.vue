<script setup>
import { computed, ref, watch } from "vue";

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

const allImages = computed(() => {
  const items = [];

  if (props.product.cover_image_url) {
    items.push({
      id: "cover",
      color_name: props.product.color || "Image principale",
      image_url: props.product.cover_image_url,
      is_default: true,
    });
  }

  for (const variant of props.product.product_variants || []) {
    if (!variant.image_url) continue;
    items.push(variant);
  }

  return items;
});

const defaultVariant = computed(() => {
  return allImages.value.find((variant) => variant.is_default) || allImages.value[0] || null;
});

const selectedVariant = ref(null);

watch(
  defaultVariant,
  (value) => {
    selectedVariant.value = value;
  },
  { immediate: true }
);

const whatsappMessage = computed(() => {
  return encodeURIComponent(
    `Bonjour, je suis intéressé par ce pagne :
Nom : ${props.product.name}
Catégorie : ${props.product.category}
Couleur : ${selectedVariant.value?.color_name || "N/A"}

Pouvez-vous me donner plus d’informations ?`
  );
});
</script>

<template>
  <div class="grid gap-10 md:grid-cols-2">
    <div>
      <div class="relative aspect-square overflow-hidden rounded-3xl bg-zinc-100">
        <img
          v-if="selectedVariant?.image_url"
          :src="selectedVariant.image_url"
          :alt="product.name"
          class="h-full w-full object-cover"
        />
        <div
          v-else
          class="flex h-full items-center justify-center text-sm text-zinc-500"
        >
          Pas d’image
        </div>
      </div>

      <div v-if="allImages.length > 0" class="mt-4 flex gap-3 overflow-x-auto">
        <button
          v-for="variant in allImages"
          :key="variant.id"
          type="button"
          @click="selectedVariant = variant"
          :title="variant.color_name"
          class="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border bg-zinc-100"
          :class="
            selectedVariant?.id === variant.id
              ? 'border-black ring-2 ring-black'
              : 'border-zinc-200'
          "
        >
          <img
            :src="variant.image_url"
            :alt="variant.color_name"
            class="h-full w-full object-cover"
          />
        </button>
      </div>
    </div>

    <div>
      <div class="mb-3 flex flex-wrap gap-2">
        <span class="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
          {{ product.category }}
        </span>

        <span
          v-if="product.is_featured"
          class="rounded-full bg-black px-3 py-1 text-xs font-medium text-white"
        >
          Vedette
        </span>

        <span
          class="rounded-full px-3 py-1 text-xs font-medium"
          :class="
            product.is_available
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          "
        >
          {{ product.is_available ? "Disponible" : "Indisponible" }}
        </span>
      </div>

      <h1 class="text-3xl font-bold tracking-tight">{{ product.name }}</h1>

      <p v-if="product.reference" class="mt-2 text-sm text-zinc-500">
        Référence : {{ product.reference }}
      </p>

      <p v-if="selectedVariant?.color_name" class="mt-6 text-sm text-zinc-700">
        <span class="font-semibold">Couleur :</span>
        {{ selectedVariant.color_name }}
      </p>

      <p v-if="product.pattern" class="mt-3 text-sm text-zinc-700">
        <span class="font-semibold">Motif :</span> {{ product.pattern }}
      </p>

      <div v-if="product.description" class="mt-8">
        <h2 class="text-lg font-semibold">Description</h2>
        <p class="mt-3 leading-7 text-zinc-600">
          {{ product.description }}
        </p>
      </div>

      <a
        :href="`https://wa.me/22890045934?text=${whatsappMessage}`"
        target="_blank"
        rel="noopener noreferrer"
        class="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
      >
        Contacter sur WhatsApp
      </a>
    </div>
  </div>
</template>