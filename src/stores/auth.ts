import { defineStore } from "pinia";
import { fetchAuthSession, signOut } from "aws-amplify/auth";
interface AuthState {
  token: string | null;
  user: any;
  userId: string | null;
}

export const useAuth = defineStore("auth", {
  state: (): AuthState => ({
    userId: null,
    user: null,
    token: process.client ? localStorage.getItem("authToken") || null : null,
  }),

  getters: {
    isAuthenticated: (state): boolean => !!state.token,
  },

  actions: {
    async login(token: string, userId: string, user: any) {
      try {
        this.token = token;
        this.user = user;
        this.userId = userId;
        if (process.client) {
          localStorage.setItem("authToken", token);
          localStorage.setItem("userId", userId);
        }
      } catch (error) {
        this.logout();
      }
    },
    logout() {
      this.token = null;
      this.user = null;
      this.userId = null;
      if (process.client) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userId");
      }

      signOut().catch((error) => console.error("Disconnection error:", error));
    },
    async checkTokenValidity() {
      try {
        if (this.token) {
          const { tokens } = await fetchAuthSession();

          if (tokens?.idToken?.toString()) {
            return true;
          } else {
            return false;
          }
        }
        return false;
      } catch (error) {
        console.error("Error validating token:", error);
        return false;
      }
    },
  },
});
