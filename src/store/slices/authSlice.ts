import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { loginUser } from "@/services/auth";
import { decodeToken } from "@/lib/decodeToken";

export type Role = string;

export interface AuthUser {
  id: string;
  role: Role;
  name: string;
  email: string;
  mobileNumber?: string;
  mustChangePassword?: boolean;
}

interface LoginThunkPayload {
  mobileNumber: string;
  otp: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  forcePasswordChange: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  forcePasswordChange: false
};

export const loginUserThunk = createAsyncThunk(
  "auth/loginUser",
  async ({ mobileNumber, otp }: LoginThunkPayload, thunkApi) => {
    try {
      const data = await loginUser({ mobileNumber, otp });
      const decoded = decodeToken(data.token);

      if (!decoded) {
        throw new Error("Invalid token returned from server");
      }

      const user: AuthUser = {
        id: String(decoded.id),
        role: decoded.role,
        name: "",
        email: "",
        mobileNumber: decoded.mobileNumber,
        mustChangePassword: false
      };

      if (typeof window !== "undefined") {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(user));
      }

      return { token: data.token, user };
    } catch (error) {
      return thunkApi.rejectWithValue(
        error instanceof Error ? error.message : "Login failed"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    restoreAuth: (
      state,
      action: PayloadAction<{ token: string; user: AuthUser }>
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      state.loading = false;
      state.isAuthenticated = false;
      state.forcePasswordChange = false;
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    setForcePasswordChange: (state, action: PayloadAction<boolean>) => {
      state.forcePasswordChange = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(loginUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Login failed";
        state.isAuthenticated = false;
      });
  }
});

export const { restoreAuth, logout, clearAuthError, setForcePasswordChange } =
  authSlice.actions;
export default authSlice.reducer;
