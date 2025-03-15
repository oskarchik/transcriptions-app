import { defineNuxtRouteMiddleware } from "#app";
import { useAuth } from "@/stores/auth";
export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuth();

  if (!authStore.isAuthenticated) {
    return navigateTo("/");
  }
});
