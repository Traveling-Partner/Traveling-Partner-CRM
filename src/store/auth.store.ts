import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "ADMIN" | "AGENT";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  mustChangePassword?: boolean;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  forcePasswordChange: boolean;
  login: (params: { email: string; password: string }) => Promise<AuthUser>;
  logout: () => void;
  isAdmin: () => boolean;
  isAgent: () => boolean;
  setForcePasswordChange: (value: boolean) => void;
}

const ADMIN_USER: AuthUser = {
  id: "admin-1",
  name: "Admin User",
  email: "admin@demo.com",
  role: "ADMIN",
  mustChangePassword: false
};

const AGENT_USER: AuthUser = {
  id: "agent-1",
  name: "Sales Agent",
  email: "agent@demo.com",
  role: "AGENT",
  mustChangePassword: false
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      forcePasswordChange: false,
      async login({ email, password }) {
        // Mock auth logic with hardcoded demo users
        if (password !== "123456") {
          throw new Error("Invalid credentials");
        }

        let user: AuthUser | null = null;

        if (email.toLowerCase() === ADMIN_USER.email) {
          user = ADMIN_USER;
        } else if (email.toLowerCase() === AGENT_USER.email) {
          user = AGENT_USER;
        } else {
          throw new Error("User not found");
        }

        set({
          user,
          isAuthenticated: true,
          forcePasswordChange: Boolean(user.mustChangePassword)
        });

        return user;
      },
      logout() {
        set({ user: null, isAuthenticated: false, forcePasswordChange: false });
      },
      isAdmin() {
        return get().user?.role === "ADMIN";
      },
      isAgent() {
        return get().user?.role === "AGENT";
      },
      setForcePasswordChange(value: boolean) {
        set({ forcePasswordChange: value });
      }
    }),
    {
      name: "traveling-partner-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        forcePasswordChange: state.forcePasswordChange
      })
    }
  )
);

