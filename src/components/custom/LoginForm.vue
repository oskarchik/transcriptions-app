<template>
  <div
    class="register-container w-full max-w-lg mx-auto p-8 bg-white rounded-md shadow-lg"
  >
    <h2 class="text-2xl font-bold mb-4 text-center">Login</h2>
    <Form @submit="handleLogin">
      <!-- Email Input -->
      <div class="mb-4">
        <Label for="email" class="text-sm font-medium text-gray-700"
          >Email</Label
        >
        <Input
          type="email"
          id="email"
          v-model="email"
          required
          placeholder="Enter your email"
          class="mt-1 w-full"
        />
      </div>

      <!-- Password Input -->
      <div class="mb-4">
        <Label for="password" class="text-sm font-medium text-gray-700"
          >Password</Label
        >
        <Input
          type="password"
          id="password"
          v-model="password"
          required
          placeholder="Enter your password"
          class="mt-1 w-full"
        />
      </div>

      <!-- Submit Button -->
      <Button
        type="submit"
        class="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
      >
        Login
      </Button>
    </Form>
  </div>
</template>

<script lang="ts" setup>
const config = useRuntimeConfig();
import { ref } from "vue";
import { useRouter } from "vue-router";
import {
  signIn,
  signOut,
  getCurrentUser,
  fetchAuthSession,
} from "aws-amplify/auth";

// Importa los componentes de ShadCN
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form } from "@/components/ui/form";
import { useAuth } from "@/stores/auth"; // Importa el store de autenticación

const email = ref("");
const password = ref("");
const router = useRouter();

const handleLogin = async () => {
  const authStore = useAuth();
  await signOut();
  try {
    const user = await signIn({
      username: email.value,
      password: password.value,
    });

    if (user.isSignedIn) {
      const { userId } = await getCurrentUser();

      const { tokens } = await fetchAuthSession();

      authStore.login(tokens.accessToken?.toString(), userId);
      router.push("/dashboard");
    } else {
      router.push("/");
    }
  } catch (error) {
    console.error("Login error:", error);
  }
};
</script>
