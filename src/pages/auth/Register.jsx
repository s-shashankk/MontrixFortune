import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      navigate("/login", { replace: true });
    } catch (error) {
      setError(error.response?.data?.message || "Unable to register. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-stone-800 rounded-full mb-4">
            <span className="text-2xl text-white">🛋️</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900">MontrixFortune</h1>
          <p className="text-slate-600 mt-2">Premium Furniture Store</p>
        </div>

        {/* Registration Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Create Account</h2>
            <p className="text-slate-600 mt-1">Join us to start shopping premium furniture</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input */}
            <div>
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
                className="input"
              />
            </div>

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

            {/* Phone Input */}
            <div>
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                placeholder="+1 (555) 000-0000"
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
              <p className="text-xs text-slate-600 mt-1">
                Password must be at least 6 characters
              </p>
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start gap-2 p-3 bg-stone-100 rounded-lg">
              <input
                type="checkbox"
                required
                className="w-4 h-4 mt-0.5 rounded border-slate-300 text-stone-700"
              />
              <label className="text-sm text-slate-700">
                I agree to the{' '}
                <a href="#" className="text-stone-700 font-medium hover:underline">
                  Terms & Conditions
                </a>
                {' '}and{' '}
                <a href="#" className="text-stone-700 font-medium hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-3">
                <span>⚠️</span>
                <div>
                  <p className="font-semibold">Registration Failed</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            <p className="text-xs text-slate-500">
              By creating an account you agree to our{" "}
              <Link to="/terms" className="text-amber-800 underline">Terms &amp; Conditions</Link> and{" "}
              <Link to="/privacy-policy" className="text-amber-800 underline">Privacy Policy</Link>.
            </p>

            {/* Register Button */}
            <button
              type="submit"
              className="w-full btn btn-primary font-semibold py-3 text-lg"
            >
              Create Account
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

          {/* Login Link */}
          <div className="text-center pt-2">
            <p className="text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="text-stone-800 font-semibold hover:text-black">
                Sign in here
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

        {/* Benefits */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Why register?</h3>
          <ul className="space-y-2 text-sm text-slate-700">
            <li className="flex items-center gap-2">
              <span className="text-stone-700">✓</span>
              Track your orders in real-time
            </li>
            <li className="flex items-center gap-2">
              <span className="text-stone-700">✓</span>
              Save your favorite items
            </li>
            <li className="flex items-center gap-2">
              <span className="text-stone-700">✓</span>
              Exclusive member discounts
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Register;

