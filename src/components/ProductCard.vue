<script setup>
import { computed, ref, watch } from "vue";

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

const images = computed(() => {
  const allImages = [];

  if (props.product.cover_image_url) {
    allImages.push({
      id: "cover",
      label: props.product.color || "Image principale",
      image_url: props.product.cover_image_url,
      is_default: true,
    });
  }

  for (const variant of props.product.product_variants || []) {
    if (!variant.image_url) continue;

    allImages.push({
      id: variant.id,
      label: variant.color_name,
      image_url: variant.image_url,
      is_default: variant.is_default,
    });
  }

  return allImages;
});

const defaultImage = computed(() => {
  return images.value.find((image) => image.is_default) || images.value[0] || null;
});

const selectedImage = ref(null);

watch(
  defaultImage,
  (value) => {
    selectedImage.value = value;
  },
  { immediate: true }
);
</script>

<template>
  <article class="group">
    <div class="relative aspect-[4/5] overflow-hidden rounded-2xl bg-zinc-100">
      <router-link :to="`/product/${product.slug}`" class="block h-full w-full">
        <img
          v-if="selectedImage?.image_url"
          :src="selectedImage.image_url"
          :alt="product.name"
          class="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div
          v-else
          class="flex h-full items-center justify-center text-sm text-zinc-500"
        >
          Pas d’image
        </div>
      </router-link>

      <span
        v-if="product.is_featured"
        class="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-zinc-800 shadow-sm backdrop-blur"
      >
        Nouveauté
      </span>

      <span
        v-if="!product.is_available"
        class="absolute right-3 top-3 rounded-full bg-black/85 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm backdrop-blur"
      >
        Indisponible
      </span>
    </div>

    <div v-if="images.length > 1" class="mt-3 flex gap-2 overflow-x-auto pb-1">
      <button
        v-for="image in images"
        :key="image.id"
        type="button"
        :title="image.label"
        @click="selectedImage = image"
        class="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border bg-zinc-100 transition"
        :class="
          selectedImage?.id === image.id
            ? 'border-black ring-2 ring-black/15'
            : 'border-zinc-200 hover:border-zinc-500'
        "
      >
        <img :src="image.image_url" :alt="image.label" class="h-full w-full object-cover" />
      </button>
    </div>

    <div class="mt-4">
      <router-link
        :to="`/product/${product.slug}`"
        class="block text-base font-semibold leading-snug text-zinc-950 hover:underline"
      >
        {{ product.name }}
      </router-link>

      <div class="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-zinc-500">
        <span>{{ product.category }}</span>
        <span v-if="selectedImage?.label" class="text-zinc-300">/</span>
        <span v-if="selectedImage?.label" class="text-zinc-600">
          {{ selectedImage.label }}
        </span>
      </div>

      <p v-if="product.pattern" class="mt-2 text-sm text-zinc-400">
        Motif : {{ product.pattern }}
      </p>
    </div>
  </article>
</template>
