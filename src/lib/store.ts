"use client";
import { useSession } from "next-auth/react";

// Hook that provides the current user's role from the real session
export function useCurrentUser() {
  const { data: session, status } = useSession();

  const user = session?.user;
  const role = (user as any)?.role || "visitor";
  const userStatus = (user as any)?.status || "";

  return {
    user: user
      ? {
          id: user.id,
          name: user.name || "",
          email: user.email || "",
          role,
          status: userStatus,
          department: (user as any)?.department || "",
          avatar: (user as any)?.avatar || "",
        }
      : null,
    role: role as "trainee" | "trainer" | "admin" | "visitor",
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
  };
}
