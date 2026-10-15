import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createPaymentOrder, markPaymentFailed, verifyPayment } from "../../api/paymentApi";

const getRazorpayKey = () => import.meta.env.VITE_RAZORPAY_KEY_ID || import.meta.env.VITE_RAZORPAY_KEY;

const parsePaymentOrderResponse = (payload) => {
  if (!payload) {
    return null;
  }

  if (typeof payload === "string") {
    try {
      return JSON.parse(payload);
    } catch {
      return null;
    }
  }

  return payload;
};

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const orderId = useMemo(() => Number(location.state?.orderId), [location.state?.orderId]);
  const amount = location.state?.amount;

  const handlePayment = async () => {
    setError("");

    if (!orderId) {
      setError("Missing order details. Please place your order again.");
      return;
    }

    const razorpayKey = getRazorpayKey();
    if (!razorpayKey) {
      setError("Missing Razorpay key. Add VITE_RAZORPAY_KEY_ID to your frontend environment.");
      return;
    }

    setLoading(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError("Unable to load payment gateway. Please check your internet connection.");
        return;
      }

      const paymentOrderResponse = await createPaymentOrder({ orderId });
      const razorpayOrder = parsePaymentOrderResponse(paymentOrderResponse.data);

      if (!razorpayOrder?.id) {
        setError("Unable to initialize payment. Please try again.");
        return;
      }

      const options = {
        key: razorpayKey,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency || "INR",
        name: "Montrix Fortune",
        description: `Order #${orderId}`,
        order_id: razorpayOrder.id,
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
        },
        handler: async (response) => {
          try {
            await verifyPayment({
              orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            navigate("/order-success", { state: { orderId, paymentMethod: "RAZORPAY" }, replace: true });
          } catch (verifyErr) {
            setError(verifyErr.response?.data?.message || "Payment verification failed.");
          }
        },
        modal: {
          ondismiss: async () => {
            await markPaymentFailed({
              orderId,
              razorpayOrderId: razorpayOrder.id,
              reason: "Payment was cancelled by user",
            });
            setError("Payment cancelled. You can retry payment from this page or from My Orders.");
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to process payment right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="max-w-xl w-full bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Complete Payment</h1>
        <p className="text-slate-600 mb-6">
          Pay securely using UPI, cards, wallets, or netbanking to confirm your order.
        </p>

        <div className="bg-stone-100 rounded-lg p-4 mb-6">
          <p className="text-sm text-slate-700">Order ID: #{orderId || "-"}</p>
          <p className="text-lg font-semibold text-slate-900 mt-1">
            Amount: {amount ? `INR ${amount}` : "Amount will be fetched at payment"}
          </p>
        </div>

        {error ? (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
        ) : null}

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full btn btn-primary font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Opening payment..." : "Pay Now"}
        </button>

        <button
          onClick={() => navigate("/orders")}
          className="w-full mt-3 btn btn-secondary font-medium py-2"
        >
          Go To My Orders
        </button>
      </div>
    </div>
  );
};

export default Payment;