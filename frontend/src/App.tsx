import { Navigate, Route, Routes } from "react-router-dom";
import { AdminLayout } from "./layouts/AdminLayout";
import { PublicLayout } from "./layouts/PublicLayout";
import { AboutPage } from "./pages/About/AboutPage";
import { AdminPage } from "./pages/Admin/AdminPage";
import { ContactPage } from "./pages/Contact/ContactPage";
import { HomePage } from "./pages/Home/HomePage";
import { ProductsPage } from "./pages/Products/ProductsPage";
import { QuotePage } from "./pages/Quote/QuotePage";
import { ServicesPage } from "./pages/Services/ServicesPage";

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
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
