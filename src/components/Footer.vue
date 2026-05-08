<script setup>
</script>

<template>
  <footer class="bg-black text-white px-6 py-14">
    <div class="max-w-7xl mx-auto grid gap-10 md:grid-cols-3">

      <!-- Logo / Brand -->
      <div>
        <h2 class="text-2xl font-bold">YSAB</h2>
        <p class="mt-3 text-sm text-zinc-400">
          Vente de pagnes en gros à Lomé.
        </p>
      </div>

      <!-- Coordonnées -->
      <div>
        <h3 class="text-lg font-semibold">Coordonnées</h3>

        <p class="mt-4 text-sm text-zinc-400 leading-7">
          02, Rue de la Gare, Face BIA-Togo <br />
          Kokétimé - BP 2184 <br />
          Lomé - Togo <br />
          (+228) 90 04 59 34
        </p>
      </div>

      <!-- Horaires -->
      <div>
        <h3 class="text-lg font-semibold">Horaires</h3>

        <p class="mt-4 text-sm text-zinc-400 leading-7">
          Lundi - Samedi : 09H00 — 17H30 <br />
          Dimanche : Fermé
        </p>

        <a
          href="https://wa.me/22890045934"
          target="_blank"
          class="mt-5 inline-block rounded-full bg-white px-5 py-2 text-sm font-bold text-black"
        >
          WhatsApp
        </a>
      </div>

    </div>

    <!-- Bottom -->
    <div class="mt-10 border-t border-white/10 pt-6 text-center text-xs text-zinc-500">
      © {{ new Date().getFullYear() }} YSAB — Tous droits réservés
    </div>
  </footer>
</template>