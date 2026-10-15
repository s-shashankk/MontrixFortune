import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AppNavbar from "./components/AppNavbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/store/Home";
import ProductDetails from "./pages/store/ProductDetails";
import Cart from "./pages/store/Cart";
import Checkout from "./pages/store/Checkout";
import Payment from "./pages/store/Payment";
import Orders from "./pages/store/Orders";
import OrderSuccess from "./pages/store/OrderSuccess";
import Login from "./pages/auth/login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminProducts from "./pages/admin/Products";
import AdminOrders from "./pages/admin/Orders";
import AdminPayments from "./pages/admin/Payments";
import AdminHeroSlides from "./pages/admin/HeroSlides";
import Footer from "./components/Footer";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import Terms from "./pages/legal/Terms";
import ShippingPolicy from "./pages/legal/ShippingPolicy";
import RefundPolicy from "./pages/legal/RefundPolicy";
import ContactUs from "./pages/info/ContactUs";
import AboutUs from "./pages/info/AboutUs";
import FAQ from "./pages/info/FAQ";

function App() {
  return (
    <Router>
      <AppNavbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
        <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><Dashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/products" element={<ProtectedRoute adminOnly><AdminProducts /></ProtectedRoute>} />
        <Route path="/admin/hero-slides" element={<ProtectedRoute adminOnly><AdminHeroSlides /></ProtectedRoute>} />
        <Route path="/admin/orders" element={<ProtectedRoute adminOnly><AdminOrders /></ProtectedRoute>} />
        <Route path="/admin/payments" element={<ProtectedRoute adminOnly><AdminPayments /></ProtectedRoute>} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/shipping-policy" element={<ShippingPolicy />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
