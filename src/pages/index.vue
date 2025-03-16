<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="w-full max-w-md mx-auto p-6 bg-white rounded-md shadow-lg">
      <div class="flex flex-col justify-center">
        <!-- Condicionalmente renderizar el formulario de registro o inicio de sesión -->
        <RegisterForm v-if="isRegistering" :toggleForm="toggleForm" />
        <LoginForm v-else />

        <!-- Enlace para alternar entre el formulario de registro e inicio de sesión -->
        <div class="text-center mt-4">
          <p class="text-sm text-gray-500">
            <span v-if="isRegistering">Already have an account?</span>
            <span v-else>Don't have an account?</span>
            <a
              href="#"
              @click.prevent="toggleForm"
              class="text-indigo-600 hover:text-indigo-700"
            >
              {{ isRegistering ? "Login here" : "Register here" }}
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const isRegistering = ref(false);

const toggleForm = () => {
  isRegistering.value = !isRegistering.value;
};
</script>
