import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AdminLayout } from "./layouts/AdminLayout";
import { PublicLayout } from "./layouts/PublicLayout";
import { CategoriesPage as AdminCategoriesPage } from "./pages/admin/categories/CategoriesPage";
import { CustomersPage as AdminCustomersPage } from "./pages/admin/customers/CustomersPage";
import { HomePage as AdminHomePage } from "./pages/admin/home/HomePage";
import { InventoryPage as AdminInventoryPage } from "./pages/admin/inventory/InventoryPage";
import { LoginPage as AdminLoginPage } from "./pages/admin/login/LoginPage";
import { OrdersPage as AdminOrdersPage } from "./pages/admin/orders/OrdersPage";
import { OrderDetailPage as AdminOrderDetailPage } from "./pages/admin/orders/OrderDetailPage";
import { ProductsPage as AdminProductsPage } from "./pages/admin/products/ProductsPage";
import { QuotesPage as AdminQuotesPage } from "./pages/admin/quotes/QuotesPage";
import { QuoteDetailPage as AdminQuoteDetailPage } from "./pages/admin/quotes/QuoteDetailPage";
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
import { QuoteTrackingPage } from "./pages/client/Quote/QuoteTrackingPage";
import { AddressesPage } from "./pages/client/Account/AddressesPage";
import { ProfilePage } from "./pages/client/Account/ProfilePage";
import { OrderHistoryPage } from "./pages/client/Account/OrderHistoryPage";
import PromotionsPage from './pages/admin/promotions/PromotionsPage';
import { PricingPage } from './pages/admin/pricing/PricingPage';
import { ReturnsPage } from './pages/admin/returns/ReturnsPage';
import { ReviewsPage } from './pages/admin/reviews/ReviewsPage';
import AdminChatbotPage from './pages/admin/chatbot/AdminChatbotPage';

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/san-pham" element={<ProductsPage />} />
        <Route path="/san-pham/:slug" element={<ProductDetailPage />} />
        <Route path="/gio-hang" element={<CartPage />} />
        <Route path="/thanh-toan/ket-qua" element={<PaymentResultPage />} />
        <Route path="/tra-cuu-don-hang" element={<OrderTrackingPage />} />
        <Route path="/tai-khoan" element={<Navigate to="/tai-khoan/thong-tin" replace />} />
        <Route path="/tai-khoan/thong-tin" element={<ProfilePage />} />
        <Route path="/tai-khoan/don-hang" element={<OrderHistoryPage />} />
        <Route path="/tai-khoan/dia-chi" element={<AddressesPage />} />
        <Route path="/dich-vu" element={<Navigate to="/ve-nha-may" replace />} />
        <Route path="/bao-gia" element={<QuotePage />} />
        <Route path="/bao-gia/:id" element={<QuoteTrackingPage />} />
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
        <Route path="don-hang/:id" element={<AdminOrderDetailPage />} />
        <Route path="bao-gia" element={<AdminQuotesPage />} />
        <Route path="bao-gia/:id" element={<AdminQuoteDetailPage />} />
        <Route path="khach-hang" element={<AdminCustomersPage />} />
        <Route path="kho" element={<AdminInventoryPage />} />
        <Route path="lien-he" element={<Navigate to="/admin/bao-gia" replace />} />
        <Route path="bao-cao" element={<AdminReportsPage />} />
        <Route path="promotions" element={<PromotionsPage />} />
        <Route path="chinh-sach-gia" element={<PricingPage />} />
        <Route path="doi-tra" element={<ReturnsPage />} />
        <Route path="danh-gia" element={<ReviewsPage />} />
        <Route path="chatbot" element={<AdminChatbotPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}
