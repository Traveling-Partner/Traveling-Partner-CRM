import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  loginUserThunk,
  logout as logoutAction,
  setForcePasswordChange,
  type AuthUser,
  type Role
} from "@/store/slices/authSlice";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  forcePasswordChange: boolean;
  login: (params: { mobileNumber: string; otp: string }) => Promise<AuthUser>;
  logout: () => void;
  isAdmin: () => boolean;
  isAgent: () => boolean;
  setForcePasswordChange: (value: boolean) => void;
}

export type { AuthUser, Role };

function useAuthStoreInternal(): AuthState;
function useAuthStoreInternal<T>(selector: (state: AuthState) => T): T;
function useAuthStoreInternal<T>(selector?: (state: AuthState) => T) {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  const state: AuthState = {
    ...auth,
    login: async ({ mobileNumber, otp }) => {
      const result = await dispatch(loginUserThunk({ mobileNumber, otp })).unwrap();
      return result.user;
    },
    logout: () => {
      dispatch(logoutAction());
    },
    isAdmin: () => auth.user?.role === "ADMIN",
    isAgent: () => auth.user?.role === "AGENT",
    setForcePasswordChange: (value: boolean) => {
      dispatch(setForcePasswordChange(value));
    }
  };

  return selector ? selector(state) : state;
}

export const useAuthStore = useAuthStoreInternal;

