import { Navigate, Route, Routes } from "react-router-dom";
import { AdminLayout } from "./layouts/AdminLayout";
import { PublicLayout } from "./layouts/PublicLayout";
import { CategoriesPage as AdminCategoriesPage } from "./pages/admin/categories/CategoriesPage";
import { ContactsPage as AdminContactsPage } from "./pages/admin/contacts/ContactsPage";
import { CustomersPage as AdminCustomersPage } from "./pages/admin/customers/CustomersPage";
import { HomePage as AdminHomePage } from "./pages/admin/home/HomePage";
import { InventoryPage as AdminInventoryPage } from "./pages/admin/inventory/InventoryPage";
import { LoginPage as AdminLoginPage } from "./pages/admin/login/LoginPage";
import { OrdersPage as AdminOrdersPage } from "./pages/admin/orders/OrdersPage";
import { ProductsPage as AdminProductsPage } from "./pages/admin/products/ProductsPage";
import { QuotesPage as AdminQuotesPage } from "./pages/admin/quotes/QuotesPage";
import { ReportsPage as AdminReportsPage } from "./pages/admin/reports/ReportsPage";
import { AboutPage } from "./pages/client/About/AboutPage";
import { AuthPage } from "./pages/client/Auth/AuthPage";
import { ForgotPasswordPage } from "./pages/client/Auth/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/client/Auth/ResetPasswordPage";
import { CartPage } from "./pages/client/Cart/CartPage";
import { PaymentResultPage } from "./pages/client/Payment/PaymentResultPage";
import { OrderTrackingPage } from "./pages/client/Tracking/OrderTrackingPage";
import { HomePage } from "./pages/client/Home/HomePage";
import { ProductDetailPage } from "./pages/client/Products/ProductDetailPage";
import { ProductsPage } from "./pages/client/Products/ProductsPage";
import { QuotePage } from "./pages/client/Quote/QuotePage";
import { AddressesPage } from "./pages/client/Account/AddressesPage";
import { ChangePasswordPage } from "./pages/client/Account/ChangePasswordPage";
import { ProfilePage } from "./pages/client/Account/ProfilePage";
import { OrderHistoryPage } from "./pages/client/Account/OrderHistoryPage";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/san-pham" element={<ProductsPage />} />
        <Route path="/san-pham/:id" element={<ProductDetailPage />} />
        <Route path="/gio-hang" element={<CartPage />} />
        <Route path="/thanh-toan/ket-qua" element={<PaymentResultPage />} />
        <Route path="/tra-cuu-don-hang" element={<OrderTrackingPage />} />
        <Route path="/tai-khoan" element={<Navigate to="/tai-khoan/thong-tin" replace />} />
        <Route path="/tai-khoan/thong-tin" element={<ProfilePage />} />
        <Route path="/tai-khoan/don-hang" element={<OrderHistoryPage />} />
        <Route path="/tai-khoan/dia-chi" element={<AddressesPage />} />
        <Route path="/tai-khoan/doi-mat-khau" element={<ChangePasswordPage />} />
        <Route path="/dich-vu" element={<Navigate to="/ve-nha-may" replace />} />
        <Route path="/bao-gia" element={<QuotePage />} />
        <Route path="/ve-nha-may" element={<AboutPage />} />
        <Route path="/lien-he" element={<Navigate to="/bao-gia" replace />} />
      </Route>
      <Route path="/dang-nhap" element={<AuthPage mode="login" />} />
      <Route path="/dang-ky" element={<AuthPage mode="register" />} />
      <Route path="/quen-mat-khau" element={<ForgotPasswordPage />} />
      <Route path="/dat-lai-mat-khau" element={<ResetPasswordPage />} />
      <Route path="/admin/dang-nhap" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminHomePage />} />
        <Route path="san-pham" element={<AdminProductsPage />} />
        <Route path="danh-muc" element={<AdminCategoriesPage />} />
        <Route path="don-hang" element={<AdminOrdersPage />} />
        <Route path="bao-gia" element={<AdminQuotesPage />} />
        <Route path="khach-hang" element={<AdminCustomersPage />} />
        <Route path="kho" element={<AdminInventoryPage />} />
        <Route path="lien-he" element={<AdminContactsPage />} />
        <Route path="bao-cao" element={<AdminReportsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
