import { createSlice } from '@reduxjs/toolkit';
import { authApi, UserDto } from '../../api/authApi';

interface AuthState {
  user: UserDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start as loading until we check session
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    // When profile fetch starts
    builder.addMatcher(
      authApi.endpoints.getProfile.matchPending,
      (state) => {
        state.isLoading = true;
      },
    );
    // When profile fetch succeeds - user is authenticated
    builder.addMatcher(
      authApi.endpoints.getProfile.matchFulfilled,
      (state, { payload }) => {
        state.user = payload;
        state.isAuthenticated = true;
        state.isLoading = false;
      },
    );
    // When profile fetch fails - user is not authenticated
    builder.addMatcher(
      authApi.endpoints.getProfile.matchRejected,
      (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
      },
    );
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
