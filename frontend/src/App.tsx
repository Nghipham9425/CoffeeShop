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
import { ContactPage } from "./pages/client/Contact/ContactPage";
import { HomePage } from "./pages/client/Home/HomePage";
import { ProductsPage } from "./pages/client/Products/ProductsPage";
import { QuotePage } from "./pages/client/Quote/QuotePage";
import { ServicesPage } from "./pages/client/Services/ServicesPage";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/san-pham" element={<ProductsPage />} />
        <Route path="/dich-vu" element={<ServicesPage />} />
        <Route path="/bao-gia" element={<QuotePage />} />
        <Route path="/ve-nha-may" element={<AboutPage />} />
        <Route path="/lien-he" element={<ContactPage />} />
      </Route>
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
