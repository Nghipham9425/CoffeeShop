import { Navigate, useLocation } from "react-router-dom";
import { adminAuth } from "../../../lib/adminApi";
import { AuthPage } from "../../client/Auth/AuthPage";

type LoginLocationState = {
  from?: string;
};

export function LoginPage() {
  const location = useLocation();
  const token = adminAuth.getToken();
  const user = adminAuth.getUser();
  const state = location.state as LoginLocationState | null;
  const from = state?.from && state.from !== "/admin/dang-nhap" ? state.from : "/admin";

  if (token && user) {
    return <Navigate to={from} replace />;
  }

  return <AuthPage mode="login" adminOnly redirectTo={from} />;
}
