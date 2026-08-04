import { useCallback, useMemo, useState } from "react";
import { Navigate, Outlet, useLocation, useOutletContext } from "react-router-dom";
import { AdminSidebar } from "../components/admin/AdminSidebar";
import { AdminTopbar } from "../components/admin/AdminTopbar";
import { adminAuth, type AdminUser } from "../lib/adminApi";
import { canAccessAdminPath, getDefaultAdminPath, type StaffRole } from "../data/adminPermissions";

export type AdminOutletContext = {
  token: string | null;
  user: AdminUser | null;
  sessionVersion: number;
  setSession: (token: string, user: AdminUser) => void;
  clearSession: () => void;
};

export function useAdminOutlet() {
  return useOutletContext<AdminOutletContext>();
}

export function AdminLayout() {
  const [token, setToken] = useState<string | null>(() => adminAuth.getToken());
  const [user, setUser] = useState<AdminUser | null>(() => adminAuth.getUser());
  const [sessionVersion, setSessionVersion] = useState(0);
  const location = useLocation();

  const setSession = useCallback((nextToken: string, nextUser: AdminUser) => {
    adminAuth.setSession(nextToken, nextUser);
    setToken(nextToken);
    setUser(nextUser);
    setSessionVersion((version) => version + 1);
  }, []);

  const clearSession = useCallback(() => {
    adminAuth.clearSession();
    setToken(null);
    setUser(null);
    setSessionVersion((version) => version + 1);
  }, []);

  const context = useMemo(
    () => ({ token, user, sessionVersion, setSession, clearSession }),
    [token, user, sessionVersion, setSession, clearSession],
  );

  const allowedRoles: StaffRole[] = ["ADMIN", "SALES", "WAREHOUSE", "ACCOUNTANT"];

  if (!token || !user || !allowedRoles.includes(user.role as StaffRole)) {
    adminAuth.clearSession();
    return <Navigate to="/admin/dang-nhap" replace state={{ from: location.pathname }} />;
  }

  if (!canAccessAdminPath(user.role as StaffRole, location.pathname)) {
    return <Navigate to={getDefaultAdminPath(user.role as StaffRole)} replace />;
  }

  return (
    <div className="min-h-screen bg-[#fbf8f5] text-[#3b2419]">
      <AdminSidebar user={user} onLogout={clearSession} />
      <div className="lg:pl-72">
        <AdminTopbar />
        <Outlet context={context} />
      </div>
    </div>
  );
}
