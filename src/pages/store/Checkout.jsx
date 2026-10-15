import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { fetchAddresses, addAddress } from "../../api/addresses";
import { createOrder } from "../../api/orderApi";
import Loader from "../../components/Loader";
import { useCart } from "../../context/CartContext";

const Checkout = () => {
  const navigate = useNavigate();
  const { refreshCart } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    houseNo: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("RAZORPAY");

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const response = await fetchAddresses();
        const data = response.data?.data || response.data || [];
        setAddresses(data);
        if (data.length) {
          setSelectedAddressId(data[0].id);
        }
      } catch (err) {
        console.error("Unable to load saved addresses:", err);
        setError(err.response?.data?.message || "Unable to load saved addresses.");
      } finally {
        setLoading(false);
      }
    };
    loadAddresses();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setNewAddress((current) => ({ ...current, [name]: value }));
  };

  const handlePlaceOrder = async () => {
    setError("");

    if (useNewAddress) {
      const requiredFields = ["name", "phone", "houseNo", "street", "city", "state", "zipCode", "country"];
      const missingField = requiredFields.find((field) => !newAddress[field]?.trim());
      if (missingField) {
        setError("Please complete all address fields before placing the order.");
        return;
      }
    }

    let addressId = selectedAddressId;

    try {
      setSubmitting(true);
      if (useNewAddress) {
        const response = await addAddress(newAddress);
        addressId = response.data?.data?.id || response.data?.id;
      }

      if (!addressId) {
        setError("Please select or add an address before placing the order.");
        return;
      }

      const orderResponse = await createOrder({ addressId, paymentMethod });
      const order = orderResponse.data?.data || orderResponse.data;

      if ((order?.paymentMethod || paymentMethod) === "COD") {
        await refreshCart();
        navigate("/order-success", { state: { orderId: order?.id, paymentMethod: "COD" } });
        return;
      }

      navigate("/payment", {
        state: {
          orderId: order?.id,
          amount: order?.totalAmount,
        },
      });
    } catch (err) {
      console.error("Unable to place order:", err);
      setError(err.response?.data?.message || "Unable to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-stone-800 text-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold">Checkout</h1>
          <p className="text-stone-300 mt-2">Complete your purchase</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>{error}</div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Delivery Address Section */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Delivery Address</h2>

              {/* Address Selection Toggle */}
              <div className="mb-6 p-4 bg-stone-100 rounded-lg">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useNewAddress}
                    onChange={() => setUseNewAddress((current) => !current)}
                    className="w-5 h-5 rounded text-stone-700 cursor-pointer"
                  />
                  <span className="font-medium text-slate-900">Use a new address</span>
                </label>
              </div>

              {/* Saved Addresses */}
              {!useNewAddress && addresses.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-slate-700 font-medium">Select a saved address:</p>
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <label
                        key={address.id}
                        className="block p-4 border-2 rounded-lg cursor-pointer hover:border-stone-400 hover:bg-stone-50 transition"
                        style={{
                          borderColor: selectedAddressId === address.id ? '#57534e' : '#e2e8f0',
                          backgroundColor: selectedAddressId === address.id ? '#f5f5f4' : 'transparent',
                        }}
                      >
                        <div className="flex gap-3">
                          <input
                            type="radio"
                            name="selectedAddress"
                            value={address.id}
                            checked={selectedAddressId === address.id}
                            onChange={() => setSelectedAddressId(address.id)}
                            className="w-5 h-5 mt-1 cursor-pointer"
                          />
                          <div className="flex-1">
                            <strong className="text-lg text-slate-900">{address.fullName || address.name}</strong>
                            <p className="text-slate-700 mt-1">
                              {address.streetAddress || `${address.houseNo || ""} ${address.street || ""}`.trim()}
                            </p>
                            <p className="text-slate-600">
                              {address.city}, {address.state} {address.postalCode || address.zipCode}
                            </p>
                            <p className="text-slate-600">{address.country}</p>
                            <p className="text-stone-700 font-medium mt-2">📞 {address.phoneNumber || address.phone}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                /* Address Form */
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={newAddress.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="form-label">Phone *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={newAddress.phone}
                        onChange={handleChange}
                        placeholder="+1 (555) 000-0000"
                        className="input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">House No. *</label>
                      <input
                        type="text"
                        name="houseNo"
                        value={newAddress.houseNo}
                        onChange={handleChange}
                        placeholder="123"
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="form-label">Street *</label>
                      <input
                        type="text"
                        name="street"
                        value={newAddress.street}
                        onChange={handleChange}
                        placeholder="Main Street"
                        className="input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">City *</label>
                      <input
                        type="text"
                        name="city"
                        value={newAddress.city}
                        onChange={handleChange}
                        placeholder="New York"
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="form-label">State *</label>
                      <input
                        type="text"
                        name="state"
                        value={newAddress.state}
                        onChange={handleChange}
                        placeholder="NY"
                        className="input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Zip Code *</label>
                      <input
                        type="text"
                        name="zipCode"
                        value={newAddress.zipCode}
                        onChange={handleChange}
                        placeholder="10001"
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="form-label">Country *</label>
                      <input
                        type="text"
                        name="country"
                        value={newAddress.country}
                        onChange={handleChange}
                        placeholder="United States"
                        className="input"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Review Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Order Review</h2>

              <div className="bg-stone-100 p-4 rounded-lg mb-6">
                <p className="text-slate-700 mb-2">
                  {useNewAddress && addresses.length > 0
                    ? "✓ New address filled"
                    : selectedAddressId
                      ? "✓ Address selected"
                      : "⚠️ No address selected"}
                </p>
              </div>

              <div className="space-y-3 mb-6 pb-6 border-b border-slate-200">
                <div>
                  <p className="text-slate-700 font-medium mb-2">Payment Method</p>
                  <label className="flex items-center gap-2 text-sm text-slate-700 mb-2 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="RAZORPAY"
                      checked={paymentMethod === "RAZORPAY"}
                      onChange={(event) => setPaymentMethod(event.target.value)}
                    />
                    UPI / Card / Wallet / Netbanking (Razorpay)
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === "COD"}
                      onChange={(event) => setPaymentMethod(event.target.value)}
                    />
                    Cash On Delivery
                  </label>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-semibold">Free</span>
                </div>
                <div className="flex justify-between text-slate-900 font-semibold">
                  <span>Ready to checkout</span>
                  <span>✓</span>
                </div>
              </div>

              <p className="text-xs text-stone-500 mb-2">
                By placing this order you agree to our{" "}
                <Link to="/terms" className="underline">Terms</Link>,{" "}
                <Link to="/shipping-policy" className="underline">Shipping</Link> and{" "}
                <Link to="/refund-policy" className="underline">Refund</Link> policies.
              </p>
              <button
                onClick={handlePlaceOrder}
                disabled={submitting}
                className="w-full btn btn-primary font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span>
                    {paymentMethod === "COD" ? "Placing order..." : "Creating order..."}
                  </span>
                ) : (
                  paymentMethod === "COD" ? "Place COD Order" : "Continue To Payment"
                )}
              </button>

              <button
                onClick={() => navigate("/cart")}
                className="w-full mt-3 btn btn-secondary font-medium py-2"
              >
                Back to Cart
              </button>

              <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600">
                  🔒 Your payment information is secure and encrypted. We accept all major credit cards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
