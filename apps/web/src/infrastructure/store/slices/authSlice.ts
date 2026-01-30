import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { authApi, UserDto } from '../../api/authApi';

interface AuthState {
  user: UserDto | null;
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('token') : false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    },
    setCredentials: (state, action: PayloadAction<{ user: UserDto; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload.token);
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      authApi.endpoints.login.matchFulfilled,
      (state, { payload }) => {
        state.token = payload.accessToken;
        state.user = payload.user;
        state.isAuthenticated = true;
        localStorage.setItem('token', payload.accessToken);
        localStorage.setItem('refreshToken', payload.refreshToken);
      },
    );
    builder.addMatcher(
      authApi.endpoints.getProfile.matchFulfilled,
      (state, { payload }) => {
        state.user = payload;
        state.isAuthenticated = true;
      },
    );
  },
});

export const { logout, setCredentials } = authSlice.actions;
export default authSlice.reducer;
