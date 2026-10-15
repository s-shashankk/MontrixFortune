import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCart, updateCartQuantity, removeFromCart, clearCart } from "../../api/cartApi";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import Loader from "../../components/Loader";
import { formatINR } from "../../utils/currency";

const Cart = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const { syncFromItems } = useCart();
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getItemUnitPrice = (item) => Number(item?.price ?? item?.product?.price ?? 0);
  const getItemTotal = (item) => getItemUnitPrice(item) * (Number(item?.quantity) || 0);
  const subtotal = Array.isArray(items) ? items.reduce((sum, item) => sum + getItemTotal(item), 0) : 0;

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await getCart();
      const cartItems = response?.data?.data || response?.data?.items || [];
      const safeItems = Array.isArray(cartItems) ? cartItems : [];
      setItems(safeItems);
      syncFromItems(safeItems);
    } catch (err) {
      console.error("Unable to load cart:", err);
      setError(err.response?.data?.message || "Unable to load cart.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!auth) {
      navigate("/login");
      return;
    }
    loadCart();
  }, [auth, navigate]);

  const handleQuantityChange = async (itemId, quantity) => {
    if (quantity < 1) return;
    try {
      await updateCartQuantity(itemId, quantity);
      await loadCart();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update quantity.");
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await removeFromCart(itemId);
      await loadCart();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove item.");
    }
  };

  const handleClear = async () => {
    try {
      await clearCart();
      setItems([]);
      syncFromItems([]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to clear cart.");
    }
  };

  const handleCheckout = async () => {
    if (!items.length) {
      showToast("Your cart is empty.", "info");
      return;
    }

    navigate("/checkout");
  };

  const total = subtotal;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-stone-800 text-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold">Shopping Cart</h1>
          <p className="text-stone-300 mt-2">Review and manage your items</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <Loader />
        ) : items.length ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {items.map((item, index) => (
                  <div key={item.id} className={`p-6 border-b ${index === items.length - 1 ? 'border-b-0' : 'border-slate-200'}`}>
                    <div className="flex gap-6">
                      {/* Product Image */}
                      <div className="w-24 h-24 flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden">
                        {item.product?.imageUrl ? (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product?.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full text-slate-400">
                            📦
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-slate-900">{item.product?.name || item.name}</h3>
                        <p className="text-slate-600 mt-1">Price: <span className="font-semibold text-stone-800">{formatINR(getItemUnitPrice(item))}</span></p>
                        <p className="text-slate-500 text-sm mt-2">Item Total: <span className="font-semibold text-slate-900">{formatINR(getItemTotal(item))}</span></p>
                      </div>

                      {/* Controls */}
                      <div className="flex flex-col items-end gap-3">
                        <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-2">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="px-2 py-1 text-slate-600 hover:text-stone-900 font-semibold"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.id, Number(e.target.value))}
                            className="w-12 text-center border-0 bg-transparent font-semibold text-slate-900 focus:outline-none"
                          />
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="px-2 py-1 text-slate-600 hover:text-stone-900 font-semibold"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemove(item.id)}
                          className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition font-medium text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Continue Shopping */}
              <div className="mt-6">
                <button
                  onClick={() => navigate("/")}
                  className="px-6 py-2 text-stone-700 font-medium hover:text-stone-900 flex items-center gap-2"
                >
                  ← Continue Shopping
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Order Summary</h2>
                
                <div className="space-y-3 mb-6 pb-6 border-b border-slate-200">
                  <div className="flex justify-between text-slate-700">
                    <span>Items ({items.length})</span>
                    <span>{formatINR(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Shipping</span>
                    <span className="text-green-600 font-semibold">Free</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Taxes</span>
                    <span className="text-slate-500">Included in price</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6 text-lg font-bold text-slate-900">
                  <span>Total</span>
                  <span className="text-stone-900">{formatINR(total)}</span>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full btn btn-primary font-semibold py-3 mb-3"
                >
                  Proceed to Checkout
                </button>
                <button
                  onClick={handleClear}
                  className="w-full btn btn-secondary font-semibold py-3"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <svg className="w-20 h-20 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Cart is Empty</h2>
            <p className="text-slate-600 mb-6">Add some furniture to get started!</p>
            <button
              onClick={() => navigate("/")}
              className="btn btn-primary font-semibold"
            >
              Start Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;

