import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { createBlog, type CreateBlogPayload } from "@/services/blog";
import type { RootState } from "@/store/store";

interface BlogState {
  blogs: unknown[];
  loading: boolean;
  error: string | null;
}

const initialState: BlogState = {
  blogs: [],
  loading: false,
  error: null
};

export const createBlogThunk = createAsyncThunk(
  "blog/createBlog",
  async (blogData: CreateBlogPayload, thunkApi) => {
    try {
      const state = thunkApi.getState() as RootState;
      const token = state.auth.token;

      if (!token) {
        throw new Error("Authentication token is missing.");
      }

      const response = await createBlog(blogData, token);
      return response;
    } catch (error) {
      return thunkApi.rejectWithValue(
        error instanceof Error ? error.message : "Failed to create blog"
      );
    }
  }
);

const blogSlice = createSlice({
  name: "blog",
  initialState,
  reducers: {
    clearBlogError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createBlogThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBlogThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.blogs.unshift(action.payload);
      })
      .addCase(createBlogThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Failed to create blog";
      });
  }
});

export const { clearBlogError } = blogSlice.actions;
export default blogSlice.reducer;
