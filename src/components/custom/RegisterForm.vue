<template>
  <div
    class="register-container w-full max-w-lg mx-auto p-8 bg-white rounded-md shadow-lg"
  >
    <h2 class="text-2xl font-bold mb-4 text-center">
      {{ isVerifying ? "Confirm Registration" : "Register" }}
    </h2>

    <Form @submit="handleSubmit">
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
          :disabled="isVerifying"
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
          :disabled="isVerifying"
        />
      </div>

      <!-- Verification Code Input (Only visible during verification step) -->
      <div v-if="isVerifying" class="mb-4">
        <Label for="verificationCode" class="text-sm font-medium text-gray-700"
          >Verification Code</Label
        >
        <Input
          type="text"
          id="verificationCode"
          v-model="verificationCode"
          required
          placeholder="Enter the verification code"
          class="mt-1 w-full"
        />
      </div>

      <!-- Submit Button -->
      <Button
        type="submit"
        class="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
        :disabled="isLoading"
      >
        {{ isVerifying ? "Confirm Code" : "Register" }}
      </Button>
    </Form>
  </div>
</template>

<script lang="ts" setup>
const config = useRuntimeConfig();

import { ref } from "vue";
import { useRouter } from "vue-router";
import { signUp, confirmSignUp } from "aws-amplify/auth";

// Importa los componentes de ShadCN
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form } from "@/components/ui/form";

const email = ref("");
const password = ref("");
const verificationCode = ref("");
const isVerifying = ref(false);
const isLoading = ref(false);
const router = useRouter();

const handleSubmit = async () => {
  isLoading.value = true;

  try {
    if (!isVerifying.value) {
      // Registro de usuario
      const { user } = await signUp({
        username: email.value,
        password: password.value,
        attributes: { email: email.value },
      });
      isVerifying.value = true;
    } else {
      // Confirmación de código
      const { nextStep } = await confirmSignUp({
        username: email.value,
        confirmationCode: verificationCode.value,
      });
      if (nextStep.signUpStep === "DONE") {
        router.push("/"); // Redirige al login después de confirmar
      }
    }
  } catch (error) {
    console.error("Error during registration or verification:", error);
  } finally {
    isLoading.value = false;
  }
};
</script>
