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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm bg-gradient-to-br from-[#243250] to-[#111827] border border-amber-200/30">
              <span className="text-[#f6df9a] font-bold text-lg">MF</span>
            </div>
            <span className="font-bold text-xl text-[#1f2a44] hidden sm:inline">Montrix Fortune</span>
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
          <div className="flex items-center gap-4">
            {auth && (
              <Link to="/orders" className="md:hidden text-sm font-semibold text-[#2f3d61] hover:text-[#111827] transition">
                Orders
              </Link>
            )}
            <Link to="/cart" className="relative p-2 text-[#2f3d61] hover:text-[#111827] transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m10 0l2-9m0 0h1m-1 0h-1" />
              </svg>
              <span className="absolute top-0 right-0 min-w-4 h-4 px-1 bg-[#1f2a44] text-[#f6df9a] text-[10px] rounded-full flex items-center justify-center">{cartCount}</span>
            </Link>

            {auth ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500 hidden sm:inline">{auth?.user?.email || auth?.email}</span>
                <button onClick={handleLogout} className="btn btn-secondary text-sm">
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" className="btn btn-secondary text-sm">Login</Link>
                <Link to="/register" className="btn btn-primary text-sm">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
