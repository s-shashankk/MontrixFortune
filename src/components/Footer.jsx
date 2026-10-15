import { Link } from "react-router-dom";
import { business } from "../config/business";

const currentYear = new Date().getFullYear();
const linkClass = "text-stone-600 hover:text-stone-900 transition";

const Footer = () => {
  return (
    <footer className="relative overflow-hidden border-t border-amber-100 bg-gradient-to-b from-amber-50 via-stone-50 to-stone-100 text-stone-800">
      <div className="absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-amber-200/30 blur-3xl" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-stone-900">{business.brandName}</h3>
            <p className="mt-3 text-stone-600 text-sm leading-relaxed max-w-sm">
              Premium furniture for modern Indian homes. Thoughtful craftsmanship, honest pricing,
              and smooth doorstep delivery.
            </p>
            <p className="mt-4 text-xs tracking-[0.18em] text-amber-700 uppercase">Made For Everyday Luxury</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold tracking-wide uppercase text-stone-700">Shop</h4>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              <Link to="/" className={linkClass}>Home</Link>
              <Link to="/cart" className={linkClass}>Cart</Link>
              <Link to="/orders" className={linkClass}>My Orders</Link>
              <Link to="/about" className={linkClass}>About Us</Link>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold tracking-wide uppercase text-stone-700">Customer Care</h4>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              <Link to="/contact" className={linkClass}>Contact Us</Link>
              <Link to="/faq" className={linkClass}>FAQ</Link>
              <Link to="/shipping-policy" className={linkClass}>Shipping Policy</Link>
              <Link to="/refund-policy" className={linkClass}>Cancellation &amp; Refund</Link>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold tracking-wide uppercase text-stone-700">Contact</h4>
            <div className="mt-3 space-y-2 text-sm text-stone-600">
              <p>Email: <a className="hover:text-stone-900" href={`mailto:${business.supportEmail}`}>{business.supportEmail}</a></p>
              <p>Phone: <a className="hover:text-stone-900" href={`tel:${business.phone.replace(/\s/g, "")}`}>{business.phone}</a></p>
              <p>{business.addressLines.join(", ")}</p>
              <p className="text-xs text-stone-500">{business.supportHours}</p>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-stone-300 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-stone-500">
          <p>Copyright {currentYear} {business.legalName}. All rights reserved. Secure payments by Razorpay.</p>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="hover:text-stone-700 transition">Terms &amp; Conditions</Link>
            <Link to="/privacy-policy" className="hover:text-stone-700 transition">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
