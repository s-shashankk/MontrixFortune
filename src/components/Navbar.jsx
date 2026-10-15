import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const isAdmin =
    auth?.user?.role === "ADMIN" ||
    auth?.user?.role === "ROLE_ADMIN" ||
    (auth?.user?.roles
      ? Array.isArray(auth.user.roles)
        ? auth.user.roles.includes("ROLE_ADMIN")
        : auth.user.roles?.includes("ROLE_ADMIN")
      : false);

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <Link to="/">Montrix Fortune</Link>
      </div>
      <nav className="navbar-links">
        <Link to="/">Home</Link>
        {auth && <Link to="/cart">Cart</Link>}
        {auth && <Link to="/orders">Orders</Link>}
        {isAdmin && <Link to="/admin">Admin</Link>}
      </nav>
      <div className="navbar-actions">
        {auth ? (
          <>
            <span className="navbar-user">Hi, {auth.user?.username || auth.user?.name || "User"}</span>
            <button className="button button--ghost" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link className="button button--secondary" to="/login">
              Login
            </Link>
            <Link className="button" to="/register">
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
