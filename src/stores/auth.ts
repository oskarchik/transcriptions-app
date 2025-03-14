import { defineStore } from "pinia";
import { signOut } from "aws-amplify/auth";
interface AuthState {
  token: string | null;
  userId: string | null;
}

export const useAuth = defineStore("auth", {
  state: (): AuthState => ({
    userId: process.client ? localStorage.getItem("userId") || null : null,
    token: process.client ? localStorage.getItem("authToken") || null : null,
  }),

  getters: {
    isAuthenticated: (state): boolean => !!state.token,
  },

  actions: {
    async login(token: string, userId: string) {
      try {
        this.token = token;
        this.userId = userId;
        localStorage?.setItem("authToken", token);
        localStorage?.setItem("userId", userId);
      } catch (error) {
        this.logout();
      }
    },
    logout() {
      this.token = null;
      this.userId = null;

      localStorage?.removeItem("authToken");
      localStorage?.removeItem("userId");

      signOut().catch((error) => console.error("Disconnection error:", error));
    },
  },
});
