import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form);
      navigate("/", { replace: true });
    } catch (error) {
      setError(error.response?.data?.message || "Unable to login. Please check your credentials.");
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-stone-800 rounded-full mb-4">
            <span className="text-2xl text-white">🛋️</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900">MontrixFortune</h1>
          <p className="text-slate-600 mt-2">Premium Furniture Store</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
            <p className="text-slate-600 mt-1">Sign in to your account to continue shopping</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="input"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="input"
              />
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <a href="#" className="text-sm text-stone-700 hover:text-stone-900 font-medium">
                Forgot password?
              </a>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-3">
                <span>⚠️</span>
                <div>
                  <p className="font-semibold">Login Failed</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              className="w-full btn btn-primary font-semibold py-3 text-lg"
            >
              Sign In
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-600">or</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center pt-2">
            <p className="text-slate-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-stone-800 font-semibold hover:text-black">
                Create one now
              </Link>
            </p>
          </div>

          {/* Continue as Guest */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full py-2 border-2 border-stone-300 text-stone-700 font-medium rounded-lg hover:border-stone-400 hover:bg-stone-100 transition"
          >
            Continue as Guest
          </button>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl mb-2">🚚</div>
            <p className="text-xs text-slate-600">Fast Delivery</p>
          </div>
          <div>
            <div className="text-2xl mb-2">🛡️</div>
            <p className="text-xs text-slate-600">Secure</p>
          </div>
          <div>
            <div className="text-2xl mb-2">💬</div>
            <p className="text-xs text-slate-600">Support</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

