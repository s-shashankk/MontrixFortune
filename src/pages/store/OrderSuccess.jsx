import { Link, useLocation } from "react-router-dom";

const OrderSuccess = () => {
  const location = useLocation();
  const orderId = location.state?.orderId;
  const paymentMethod = location.state?.paymentMethod;

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="max-w-xl w-full bg-white rounded-xl shadow-lg p-10 text-center">
        <div className="text-6xl mb-4">✓</div>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Order Placed Successfully</h1>
        <p className="text-slate-600 mb-6">
          {paymentMethod === "COD"
            ? "Your Cash on Delivery order is confirmed and will be processed shortly."
            : "Your payment is verified and your order is confirmed."}
        </p>

        {orderId ? (
          <p className="text-stone-700 font-semibold mb-8">Order ID: #{orderId}</p>
        ) : null}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/orders" className="btn btn-primary font-semibold">
            View My Orders
          </Link>
          <Link to="/" className="btn btn-secondary font-semibold">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
