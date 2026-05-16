import { createRouter, createWebHistory } from "vue-router";
import { supabase } from "../lib/supabase";

import Home from "../pages/Home.vue";
import Catalogue from "../pages/Catalogue.vue";
import ProductPage from "../pages/ProductPage.vue";
import Login from "../pages/Login.vue";
import AdminHome from "../pages/admin/AdminHome.vue";
import AdminProducts from "../pages/admin/AdminProducts.vue";
import AdminProductNew from "../pages/admin/AdminProductNew.vue";
import AdminProductEdit from "../pages/admin/AdminProductEdit.vue";
import AdminProductVariants from "../pages/admin/AdminProductVariants.vue";
const routes = [
  { path: "/", component: Home },
  { path: "/catalogue", component: Catalogue },
  { path: "/product/:slug", component: ProductPage },
  { path: "/login", component: Login },
  { path: "/admin", component: AdminHome, meta: { requiresAuth: true } },
  {
    path: "/admin/products",
    component: AdminProducts,
    meta: { requiresAuth: true },
  },
  {
    path: "/admin/products/new",
    component: AdminProductNew,
    meta: { requiresAuth: true },
  },
  {
    path: "/admin/products/:id/edit",
    component: AdminProductEdit,
    meta: { requiresAuth: true },
  },
  {
    path: "/admin/products/:id/variants",
    component: AdminProductVariants,
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