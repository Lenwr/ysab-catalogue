import { createRouter, createWebHistory } from "vue-router";
import { supabase } from "../lib/supabase";

const routes = [
  { path: "/", component: () => import("../pages/Home.vue") },
  { path: "/catalogue", component: () => import("../pages/Catalogue.vue") },
  { path: "/product/:slug", component: () => import("../pages/ProductPage.vue") },
  { path: "/login", component: () => import("../pages/Login.vue") },
  {
    path: "/admin",
    component: () => import("../pages/admin/AdminHome.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/admin/products",
    component: () => import("../pages/admin/AdminProducts.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/admin/products/new",
    component: () => import("../pages/admin/AdminProductNew.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/admin/products/:id/edit",
    component: () => import("../pages/admin/AdminProductEdit.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/admin/products/:id/variants",
    component: () => import("../pages/admin/AdminProductVariants.vue"),
    meta: { requiresAuth: true },
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return true;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return "/login";
  }

  return true;
});
