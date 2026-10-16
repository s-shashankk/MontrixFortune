import { Link } from "react-router-dom";
import { business, whatsappLink } from "../config/business";

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
              <p>Support: <a className="hover:text-stone-900 break-all" href={`mailto:${business.supportEmail}`}>{business.supportEmail}</a></p>
              <p>Sales: <a className="hover:text-stone-900 break-all" href={`mailto:${business.salesEmail}`}>{business.salesEmail}</a></p>
              {business.phones.map((p) => (
                <p key={p.tel}>
                  {p.label}: <a className="hover:text-stone-900" href={`tel:${p.tel}`}>{p.display}</a>
                </p>
              ))}
              <p className="text-xs text-stone-500">{business.supportHours}</p>
            </div>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1fb857] transition"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2c0 1.3.9 2.5 1 2.7.1.2 1.8 2.8 4.4 3.9 1.6.7 2.2.7 3 .6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" />
              </svg>
              Chat on WhatsApp
            </a>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-stone-600">
          {business.addresses.map((address) => (
            <div key={address.label}>
              <h4 className="text-sm font-semibold tracking-wide uppercase text-stone-700">{address.label}</h4>
              <p className="mt-2 leading-relaxed">
                {address.lines.map((line, i) => (<span key={i}>{line}{i < address.lines.length - 1 ? <br /> : null}</span>))}
              </p>
            </div>
          ))}
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
