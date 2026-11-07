import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { Spinner } from "../components/ui/State";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Spinner />;
  if (!session) return <Navigate to="/kirish" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}

export function RequireTeacher({ children }: { children: ReactNode }) {
  const { session, loading, isTeacherUp, profile } = useAuth();
  if (loading || (session && !profile)) return <Spinner />;
  if (!session) return <Navigate to="/kirish" replace />;
  if (!isTeacherUp) return <Navigate to="/kabinet" replace />;
  return <>{children}</>;
}
