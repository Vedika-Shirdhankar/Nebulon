import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

/**
 * useAuth()
 * Returns: { user, role, loading, signOut }
 *
 * Usage:
 *   const { user, role } = useAuth();
 */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthContext.Provider>");
  }
  return ctx;
};