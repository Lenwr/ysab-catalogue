<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "../lib/supabase";

const router = useRouter();
const isOpen = ref(false);
const isLoggedIn = ref(false);

onMounted(async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  isLoggedIn.value = !!session;

  supabase.auth.onAuthStateChange((_event, session) => {
    isLoggedIn.value = !!session;
  });
});

async function handleLogout() {
  await supabase.auth.signOut();
  isOpen.value = false;
  router.push("/");
}

const navLinks = [
  { label: "Accueil", to: "/" },
  { label: "Catalogue", to: "/catalogue" },
];
</script>

<template>
  <header class="sticky top-0 z-50 px-4 py-4 md:px-6">
    <div
      class="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/60 bg-white/75 px-5 py-3 shadow-[0_10px_35px_rgba(0,0,0,0.08)] backdrop-blur-xl"
    >
      <!-- LOGO -->
      <router-link to="/" class="flex items-center gap-3">
        <div
          class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-black/10 bg-white"
        >
          <img
            src="/logo.jpg"
            alt="YSAB"
            class="h-full w-full object-cover"
          />
        </div>

        <div class="leading-tight">
          <p class="text-sm font-black tracking-wide">
            YSAB
          </p>

          <p class="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
            Pagnes
          </p>
        </div>
      </router-link>

      <!-- NAV -->
      <nav class="hidden items-center gap-8 md:flex">
        <router-link
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="text-sm font-semibold text-zinc-600 transition hover:text-black"
        >
          {{ link.label }}
        </router-link>

        <a
          href="https://wa.me/22890045934"
          target="_blank"
          rel="noopener noreferrer"
          class="text-sm font-semibold text-zinc-600 transition hover:text-black"
        >
          WhatsApp
        </a>

        <router-link
          v-if="isLoggedIn"
          to="/admin"
          class="text-sm font-semibold text-zinc-600 transition hover:text-black"
        >
          Admin
        </router-link>

        <button
          v-if="isLoggedIn"
          type="button"
          class="text-sm font-semibold text-zinc-600 transition hover:text-black"
          @click="handleLogout"
        >
          Déconnexion
        </button>
      </nav>

      <!-- MOBILE BUTTON -->
      <button
        type="button"
        class="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 md:hidden"
        @click="isOpen = !isOpen"
      >
        <span class="text-xl leading-none">
          {{ isOpen ? "×" : "☰" }}
        </span>
      </button>
    </div>

    <!-- MOBILE MENU -->
    <div
      v-if="isOpen"
      class="mx-auto mt-3 max-w-7xl rounded-[1.8rem] border border-white/60 bg-white/90 p-4 shadow-[0_10px_35px_rgba(0,0,0,0.08)] backdrop-blur-xl md:hidden"
    >
      <div class="flex flex-col gap-2">
        <router-link
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="rounded-2xl px-4 py-3 text-sm font-semibold hover:bg-zinc-100"
          @click="isOpen = false"
        >
          {{ link.label }}
        </router-link>

        <a
          href="https://wa.me/22890045934"
          target="_blank"
          rel="noopener noreferrer"
          class="rounded-2xl px-4 py-3 text-sm font-semibold hover:bg-zinc-100"
        >
          WhatsApp
        </a>

        <router-link
          v-if="isLoggedIn"
          to="/admin"
          class="rounded-2xl px-4 py-3 text-sm font-semibold hover:bg-zinc-100"
          @click="isOpen = false"
        >
          Admin
        </router-link>

        <button
          v-if="isLoggedIn"
          type="button"
          class="rounded-2xl px-4 py-3 text-left text-sm font-semibold hover:bg-zinc-100"
          @click="handleLogout"
        >
          Déconnexion
        </button>
      </div>
    </div>
  </header>
</template>
