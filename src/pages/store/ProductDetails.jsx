import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProductById } from "../../api/productApi";
import { addToCart } from "../../api/cartApi";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import Loader from "../../components/Loader";
import { formatINR } from "../../utils/currency";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const { refreshCart } = useCart();
  const { showToast } = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetchProductById(id);
        setProduct(response.data);
      } catch (err) {
        console.error("Failed to load product details:", err);
        setError(err.response?.data?.message || "Unable to load product details.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleAddToCart = async () => {
    if (!auth) {
      navigate("/login");
      return;
    }

    if (!product?.id) {
      showToast("Product data is not available.", "error");
      return;
    }

    try {
      await addToCart(product.id, 1);
      await refreshCart();
      showToast("Added to cart.", "success");
    } catch (err) {
      console.error("Failed to add to cart:", err);
      showToast(err.response?.data?.message || "Unable to add item to cart.", "error");
    }
  };

  if (loading) return <Loader />;
  if (error) return <div className="empty-state">{error}</div>;
  if (!product) return <div className="empty-state">Product not found.</div>;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate(-1)}
            className="text-stone-100 hover:text-white flex items-center gap-2 font-medium"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-lg shadow-md p-6 md:p-10">
          {/* Image Section */}
          <div className="flex items-center justify-center bg-slate-100 rounded-lg aspect-square overflow-hidden">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                </svg>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="flex flex-col justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{product.name}</h1>
              
              <div className="mb-6">
                <p className="text-xl text-slate-600 mb-2">Price</p>
                <p className="text-4xl font-bold text-stone-800">{formatINR(product?.price)}</p>
              </div>

              <div className="mb-8">
                <p className="text-lg font-semibold text-slate-900 mb-2">Description</p>
                <p className="text-slate-700 leading-relaxed">
                  {product.description || "No additional details available. This premium furniture piece combines comfort and style for your living space."}
                </p>
              </div>

              {/* Product Features */}
              <div className="bg-stone-100 p-6 rounded-lg mb-8">
                <h3 className="font-semibold text-slate-900 mb-3">Key Features</h3>
                <ul className="space-y-2 text-slate-700">
                  <li className="flex items-start">
                    <span className="text-stone-700 mr-2">✓</span>
                    Premium quality materials
                  </li>
                  <li className="flex items-start">
                    <span className="text-stone-700 mr-2">✓</span>
                    Expert craftsmanship
                  </li>
                  <li className="flex items-start">
                    <span className="text-stone-700 mr-2">✓</span>
                    Durable construction
                  </li>
                  <li className="flex items-start">
                    <span className="text-stone-700 mr-2">✓</span>
                    Modern design
                  </li>
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t border-slate-200">
              <button
                onClick={handleAddToCart}
                className="flex-1 btn btn-primary"
              >
                Add to Cart
              </button>
              <button
                onClick={() => navigate(-1)}
                className="flex-1 btn btn-secondary"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Why Choose This Product?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-stone-700 text-3xl mb-3">🚚</div>
              <h3 className="font-semibold text-slate-900 mb-2">Fast Delivery</h3>
              <p className="text-slate-600">Quick and reliable shipping to your doorstep</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-stone-700 text-3xl mb-3">🛡️</div>
              <h3 className="font-semibold text-slate-900 mb-2">Quality Guaranteed</h3>
              <p className="text-slate-600">30-day money-back guarantee on all items</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-stone-700 text-3xl mb-3">💬</div>
              <h3 className="font-semibold text-slate-900 mb-2">Support</h3>
              <p className="text-slate-600">Dedicated customer support team available</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;

