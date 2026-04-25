"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { UserDto } from "@/infrastructure/api/authApi";

const UserContext = createContext<UserDto | null>(null);

interface UserProviderProps {
  user: UserDto | null;
  children: ReactNode;
}

export function UserProvider({ user, children }: UserProviderProps) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useCurrentUser(): UserDto | null {
  return useContext(UserContext);
}

export function useIsAuthenticated(): boolean {
  return useContext(UserContext) !== null;
}
