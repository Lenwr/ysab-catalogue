<script setup>
import { onMounted, ref } from "vue";
import { supabase } from "../lib/supabase";
import Footer from "../components/Footer.vue";

const heroImages = ["/images/waxhollandais.jpg", "/images/superwax.jpg", "/images/hero1.jpeg", "/images/hero2.jpeg"];

const categories = [
  { name: "Wax Hollandais", image: "/images/wax hollandais.png" },
  { name: "Super Wax", image: "/images/super wax.png" },
  { name: "Nouveautés", image: "/images/nouveautes.png" },
];

const featuredProducts = ref([]);

function getProductImage(product) {
  const defaultVariant = product.product_variants?.find(
    (variant) => variant.is_default
  );

  return (
    defaultVariant?.image_url ||
    product.product_variants?.[0]?.image_url ||
    product.cover_image_url ||
    ""
  );
}

onMounted(async () => {
  const { data } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      category,
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
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(4);

  featuredProducts.value = data || [];
});
</script>

<template>
  <main class="min-h-screen bg-[#f6f1ea] text-black">
    <!-- HERO -->
    <section class="px-4 pb-8 pt-6 md:px-6 md:pb-12 md:pt-8">
      <div
        class="mx-auto max-w-7xl rounded-[2rem] border border-white/60 bg-white/55 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-xl md:rounded-[2.5rem] md:p-8"
      >
        <div class="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <div
              class="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-zinc-600 shadow-sm"
            >
              <span class="h-2 w-2 rounded-full bg-black" />
              YSAB • Lomé
            </div>

            <h1
              class="mt-6 max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl"
            >
              Le catalogue de pagnes qui met vos collections en valeur.
            </h1>

            <p class="mt-5 max-w-xl text-base leading-8 text-zinc-600 md:text-lg">
              Découvrez des modèles élégants, des variantes de couleurs riches
              et une présentation premium pensée pour inspirer vos clients.
            </p>

            <div class="mt-8 flex flex-col gap-3 sm:flex-row">
              <router-link
                to="/catalogue"
                class="inline-flex items-center justify-center rounded-full bg-black px-7 py-4 text-sm font-bold text-white shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-zinc-800"
              >
                Voir le catalogue
              </router-link>

              <a
                href="https://wa.me/22890045934"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center justify-center rounded-full border border-black/10 bg-white/80 px-7 py-4 text-sm font-bold text-black shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
              >
                Contacter sur WhatsApp
              </a>
            </div>

            <div class="mt-10 grid gap-4 sm:grid-cols-3">
              <div
                class="rounded-[1.5rem] border border-white/70 bg-white/65 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.06)] backdrop-blur-md"
              >
                <p class="text-2xl font-bold">Premium</p>
                <p class="mt-1 text-sm text-zinc-500">Présentation haut de gamme</p>
              </div>

              <div
                class="rounded-[1.5rem] border border-white/70 bg-white/65 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.06)] backdrop-blur-md"
              >
                <p class="text-2xl font-bold">Variantes</p>
                <p class="mt-1 text-sm text-zinc-500">Plusieurs couleurs par modèle</p>
              </div>

              <div
                class="rounded-[1.5rem] border border-white/70 bg-white/65 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.06)] backdrop-blur-md"
              >
                <p class="text-2xl font-bold">Direct</p>
                <p class="mt-1 text-sm text-zinc-500">Contact rapide avec les clients</p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div
              class="overflow-hidden rounded-[1.8rem] border border-white/70 bg-white/70 p-2 shadow-[0_18px_40px_rgba(0,0,0,0.08)]"
            >
              <div class="aspect-[3/4] overflow-hidden rounded-[1.35rem]">
                <img
                  :src="heroImages[2]"
                  alt="Pagne YSAB"
                  class="h-full w-full object-cover"
                />
              </div>
            </div>

            <div
              class="mt-10 overflow-hidden rounded-[1.8rem] border border-white/70 bg-white/70 p-2 shadow-[0_18px_40px_rgba(0,0,0,0.08)]"
            >
              <div class="aspect-[3/4] overflow-hidden rounded-[1.35rem]">
                <img
                  :src="heroImages[3]"
                  alt="Collection YSAB"
                  class="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- VIDEO -->
    <section class="px-4 py-8 md:px-6 md:py-10">
      <div
        class="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-white/60 bg-white/45 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-xl md:rounded-[2.5rem]"
      >
        <div class="relative h-[55vh] overflow-hidden rounded-[1.6rem] md:h-[70vh]">
          <video
            autoplay
            muted
            loop
            playsinline
            preload="none"
            class="absolute inset-0 h-full w-full object-cover"
          >
            <source src="/videos/videoaccueil.webm" type="video/mp4" />
          </video>

          <div
            class="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-black/10"
          />

          <div
            class="relative z-10 flex h-full items-end p-6 md:items-center md:p-10"
          >
            <div
              class="max-w-2xl rounded-[1.5rem] border border-white/20 bg-white/10 p-6 text-white shadow-[0_10px_40px_rgba(0,0,0,0.15)] backdrop-blur-md md:p-8"
            >
              <p class="text-xs font-semibold uppercase tracking-[0.3em] text-white/75">
                Univers YSAB
              </p>

              <h2 class="mt-3 text-3xl font-bold md:text-5xl">
                L’élégance du pagne africain en mouvement
              </h2>

              <p class="mt-4 text-sm leading-7 text-white/85 md:text-base">
                Une présentation immersive pour mettre en avant vos collections,
                vos couleurs et l’identité de votre marque.
              </p>

              <router-link
                to="/catalogue"
                class="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition hover:bg-zinc-100"
              >
                Explorer le catalogue
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CATEGORIES -->
    <section class="px-4 py-10 md:px-6 md:py-14">
      <div class="mx-auto max-w-7xl">
        <div class="mb-8 flex items-end justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
              Collections
            </p>
            <h2 class="mt-3 text-3xl font-bold">Explorer les catégories</h2>
          </div>

          <router-link
            to="/catalogue"
            class="hidden rounded-full border border-black/10 bg-white/70 px-5 py-3 text-sm font-bold shadow-sm transition hover:bg-white sm:inline-flex"
          >
            Tout voir
          </router-link>
        </div>

        <div class="grid gap-5 md:grid-cols-3">
          <router-link
            v-for="item in categories"
            :key="item.name"
            to="/catalogue"
            class="group overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 shadow-[0_15px_40px_rgba(0,0,0,0.06)] backdrop-blur-md transition hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)]"
          >
            <div class="relative aspect-[4/4] overflow-hidden">
              <img
                :src="item.image"
                :alt="item.name"
                class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent"
              />
            </div>

            <div class="p-6">
              <h3 class="text-xl font-bold">{{ item.name }}</h3>
              <p class="mt-2 text-sm text-zinc-600">
                Voir les modèles disponibles
              </p>
            </div>
          </router-link>
        </div>

        <router-link
          to="/catalogue"
          class="mt-6 inline-flex rounded-full border border-black/10 bg-white/70 px-5 py-3 text-sm font-bold shadow-sm sm:hidden"
        >
          Tout voir
        </router-link>
      </div>
    </section>

    <!-- FEATURED -->
    <section class="px-4 py-10 md:px-6 md:py-14">
      <div
        class="mx-auto max-w-7xl rounded-[2rem] border border-white/60 bg-white/45 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-xl md:rounded-[2.5rem] md:p-8"
      >
        <div class="mb-8 flex items-end justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
              Sélection
            </p>
            <h2 class="mt-3 text-3xl font-bold">Produits en vedette</h2>
          </div>

          <router-link
            to="/catalogue"
            class="hidden rounded-full border border-black/10 bg-white/70 px-5 py-3 text-sm font-bold shadow-sm transition hover:bg-white sm:inline-flex"
          >
            Voir tout
          </router-link>
        </div>

        <div
          v-if="!featuredProducts.length"
          class="rounded-[1.5rem] border border-black/5 bg-white/70 p-8 text-center text-sm text-zinc-500"
        >
          Aucun produit en vedette pour le moment.
        </div>

        <div v-else class="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <router-link
            v-for="product in featuredProducts"
            :key="product.id"
            :to="`/product/${product.slug}`"
            class="group overflow-hidden rounded-[1.8rem] border border-white/70 bg-white/70 p-3 shadow-[0_15px_35px_rgba(0,0,0,0.06)] transition hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(0,0,0,0.1)]"
          >
            <div class="relative aspect-[4/5] overflow-hidden rounded-[1.3rem] bg-zinc-100">
              <img
                v-if="getProductImage(product)"
                :src="getProductImage(product)"
                :alt="product.name"
                class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div
                v-else
                class="flex h-full items-center justify-center text-sm text-zinc-500"
              >
                Pas d’image
              </div>

              <span
                class="absolute left-4 top-4 rounded-full border border-white/70 bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-wide text-zinc-800 shadow-sm backdrop-blur"
              >
                Vedette
              </span>
            </div>

            <div class="p-2 pt-4">
              <p class="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {{ product.category }}
              </p>

              <h3 class="mt-2 text-lg font-bold text-zinc-900">
                {{ product.name }}
              </h3>

              <p class="mt-3 text-sm font-medium text-zinc-600">
                Voir le détail →
              </p>
            </div>
          </router-link>
        </div>
      </div>
    </section>

    <!-- STORY BLOCK -->
    <section class="px-4 pb-10 pt-2 md:px-6 md:pb-14">
      <div class="mx-auto max-w-7xl">
        <div
          class="grid gap-6 rounded-[2rem] border border-white/60 bg-white/55 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-xl md:grid-cols-[1.2fr_0.8fr] md:items-center md:rounded-[2.5rem] md:p-8"
        >
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
              YSAB
            </p>
            <h2 class="mt-3 text-3xl font-bold">
              Une présentation plus élégante pour mieux valoriser chaque pagne
            </h2>
            <p class="mt-4 max-w-2xl text-base leading-8 text-zinc-600">
              Chaque modèle mérite une mise en scène claire, moderne et
              inspirante. Avec un catalogue visuel fort, vos clients trouvent
              plus vite les couleurs, les motifs et les collections qui leur
              correspondent.
            </p>
          </div>

          <div
            class="rounded-[1.8rem] border border-black/5 bg-[#f8f4ee] p-6 shadow-inner"
          >
            <div class="space-y-4">
              <div class="rounded-[1.2rem] bg-white p-4 shadow-sm">
                <p class="text-sm font-semibold">Variantes couleur</p>
                <p class="mt-1 text-sm text-zinc-500">
                  Une fiche produit plus riche et plus claire.
                </p>
              </div>

              <div class="rounded-[1.2rem] bg-white p-4 shadow-sm">
                <p class="text-sm font-semibold">Présentation premium</p>
                <p class="mt-1 text-sm text-zinc-500">
                  Un rendu plus moderne pour inspirer confiance.
                </p>
              </div>

              <div class="rounded-[1.2rem] bg-white p-4 shadow-sm">
                <p class="text-sm font-semibold">Contact rapide</p>
                <p class="mt-1 text-sm text-zinc-500">
                  Le client peut demander plus d’infos en un clic.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <Footer />
  </main>
</template>