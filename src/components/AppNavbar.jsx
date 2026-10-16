import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function AppNavbar() {
  const { auth, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-amber-200/80 bg-[#fff9ea]/95 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16 gap-2">
          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0" aria-label="Montrix Fortune - Home">
            <img
              src="/logo.png"
              alt="Montrix Fortune - Manufacture of all kind Modular Furniture"
              className="h-7 sm:h-11 w-auto"
            />
          </Link>

          {/* Center Nav Links */}
          <nav className="hidden md:flex gap-8">
            <Link to="/" className="text-[#2f3d61] hover:text-[#111827] font-semibold transition">Shop</Link>
            {auth && (
              <Link to="/orders" className="text-[#2f3d61] hover:text-[#111827] font-semibold transition">My Orders</Link>
            )}
            {(auth?.user?.role === 'ADMIN' || auth?.user?.role === 'ROLE_ADMIN') && (
              <Link to="/admin" className="text-[#2f3d61] hover:text-[#111827] font-semibold transition">Admin</Link>
            )}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1 sm:gap-4">
            {auth && (
              <Link to="/orders" className="md:hidden text-xs font-semibold text-[#2f3d61] hover:text-[#111827] transition px-1">
                Orders
              </Link>
            )}
            <Link to="/cart" aria-label="Cart" className="relative p-1.5 sm:p-2 text-[#2f3d61] hover:text-[#111827] transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m10 0l2-9m0 0h1m-1 0h-1" />
              </svg>
              <span className="absolute top-0 right-0 min-w-4 h-4 px-1 bg-[#1f2a44] text-[#f6df9a] text-[10px] rounded-full flex items-center justify-center">{cartCount}</span>
            </Link>

            {auth ? (
              <div className="flex items-center gap-1.5 sm:gap-3">
                <span className="text-sm text-slate-500 hidden sm:inline">{auth?.user?.email || auth?.email}</span>
                <button
                  onClick={handleLogout}
                  aria-label="Logout"
                  className="btn btn-secondary text-sm h-8 w-8 p-0! rounded-full! sm:h-auto sm:w-auto sm:px-4! sm:py-2! sm:rounded-lg!"
                >
                  <svg className="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex gap-1.5 sm:gap-2">
                <Link to="/login" className="btn btn-secondary text-xs! sm:text-sm! px-3! py-1.5! sm:px-4! sm:py-2! tracking-normal!">Login</Link>
                <Link to="/register" className="btn btn-primary text-xs! sm:text-sm! px-3! py-1.5! sm:px-4! sm:py-2! tracking-normal!">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
