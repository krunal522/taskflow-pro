// ============================================
// AUTH SLICE — Redux state for authentication
// ============================================

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../../../services/auth.service';
import { storageService } from '../../../services/storage.service';
import { User, LoginPayload, RegisterPayload } from '../../../types/user.types';
import { LoadingState } from '../../../types/common.types';

interface AuthState {
  user: User | null;
  token: string | null;
  status: LoadingState;
  error: string | null;
}

const initialState: AuthState = {
  user: storageService.getUser(),
  token: storageService.getToken(),
  status: 'idle',
  error: null,
};

// Async Thunks
export const loginThunk = createAsyncThunk(
  'auth/login',
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      return await authService.login(payload);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
  }
);

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (payload: RegisterPayload, { rejectWithValue }) => {
    try {
      return await authService.register(payload);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Registration failed');
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.status = 'idle';
      state.error = null;
      storageService.clearAuth();
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      storageService.setUser(action.payload);
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    const handlePending = (state: AuthState) => {
      state.status = 'loading';
      state.error = null;
    };
    const handleFulfilled = (state: AuthState, action: PayloadAction<{ user: User; token: string }>) => {
      state.status = 'succeeded';
      state.user = action.payload.user;
      state.token = action.payload.token;
    };
    const handleRejected = (state: AuthState, action: any) => {
      state.status = 'failed';
      state.error = action.payload as string;
    };

    builder
      .addCase(loginThunk.pending, handlePending)
      .addCase(loginThunk.fulfilled, handleFulfilled)
      .addCase(loginThunk.rejected, handleRejected)
      .addCase(registerThunk.pending, handlePending)
      .addCase(registerThunk.fulfilled, handleFulfilled)
      .addCase(registerThunk.rejected, handleRejected);
  },
});

export const { logout, updateUser, clearError } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => !!state.auth.token;
