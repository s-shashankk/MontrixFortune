import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUserOrders } from "../../api/orderApi";
import Loader from "../../components/Loader";
import { formatINR } from "../../utils/currency";

const getStatusMeta = (status) => {
  switch (status) {
    case "CONFIRMED":
      return { label: "Paid", classes: "bg-green-100 text-green-700" };
    case "PACKING":
      return { label: "Packing", classes: "bg-amber-100 text-amber-700" };
    case "OUT_FOR_SHIPMENT":
    case "SHIPPED":
      return { label: "Out for Shipment", classes: "bg-sky-100 text-sky-700" };
    case "DELIVERED":
      return { label: "Delivered", classes: "bg-emerald-100 text-emerald-700" };
    case "ORDER_FAILED":
      return { label: "Payment Failed", classes: "bg-red-100 text-red-700" };
    case "CANCELLED":
      return { label: "Cancelled", classes: "bg-red-100 text-red-700" };
    case "PENDING":
    default:
      return { label: "Pending", classes: "bg-yellow-100 text-yellow-700" };
  }
};

const sortOrdersNewestFirst = (list) =>
  [...list].sort((a, b) => {
    const dateA = a?.orderDate ? new Date(a.orderDate).getTime() : 0;
    const dateB = b?.orderDate ? new Date(b.orderDate).getTime() : 0;

    if (dateA !== dateB) {
      return dateB - dateA;
    }

    return (Number(b?.id) || 0) - (Number(a?.id) || 0);
  });

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const toggleExpanded = (orderId) => {
    setExpandedOrders((previous) => ({
      ...previous,
      [orderId]: !previous[orderId],
    }));
  };

  useEffect(() => {
    const loadOrders = async (showLoader = false) => {
      try {
        if (showLoader) {
          setLoading(true);
        }

        const response = await fetchUserOrders();
        const payload = response.data?.data || response.data;
        const rawOrders = payload?.content || payload || [];
        setOrders(sortOrdersNewestFirst(rawOrders));
        setError("");
      } catch (err) {
        console.error("Unable to load orders:", err);
        setError(err.response?.data?.message || "Unable to load orders.");
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    };

    loadOrders(true);

    const intervalId = setInterval(() => {
      loadOrders(false);
    }, 15000);

    return () => clearInterval(intervalId);
  }, []);

  const formatAddress = (address) => {
    if (!address) {
      return "Not available";
    }

    return [
      address.fullName,
      address.streetAddress,
      address.city,
      address.state,
      address.postalCode,
      address.country,
      address.phoneNumber,
    ]
      .filter(Boolean)
      .join(", ");
  };

  return (
    <div className="min-h-screen bg-transparent">
      <div className="bg-gradient-to-r from-[#1c2742] via-[#223154] to-[#2f446f] text-[#f7e4ac] border-b border-amber-200/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold">Your Orders</h1>
          <p className="text-amber-100/85 mt-2">Track and view your purchase history</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <Loader />
        ) : orders.length ? (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusMeta = getStatusMeta(order.orderStatus || order.status);
              const isExpanded = !!expandedOrders[order.id];

              return (
                <div
                  key={order.id}
                  className="bg-white/95 border border-[#e3d2a6] rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-[#f8eed3] to-[#f4e7c4] p-6 border-b border-[#e1c98f]">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h3 className="text-2xl font-bold text-[#1f2a44]">Order #{order.id}</h3>
                        <p className="text-[#4d5a76] mt-1">
                          Status:{" "}
                          <span className={`font-semibold px-3 py-1 rounded-full text-sm inline-block ${statusMeta.classes}`}>
                            {statusMeta.label}
                          </span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-[#1f2a44]">
                          {formatINR(order?.totalAmount)}
                        </p>
                        <p className="text-[#4d5a76] text-sm">Order Total</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div>
                        <p className="text-[#5b6780] text-sm font-medium">Items</p>
                        <p className="text-2xl font-bold text-[#1f2a44]">
                          {order.items?.length || order.orderDetails?.length || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-[#5b6780] text-sm font-medium">Delivery Address</p>
                        <p className="text-[#1f2a44] font-medium">
                          {formatAddress(order.shippingAddress || order.address)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[#5b6780] text-sm font-medium">Estimated Delivery</p>
                        <p className="text-[#1f2a44] font-medium">3-5 business days</p>
                      </div>
                    </div>

                    {isExpanded && order.paymentFailureReason ? (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                        {order.paymentFailureReason}
                      </div>
                    ) : null}

                    {isExpanded && (order.items || order.orderDetails) && (order.items?.length > 0 || order.orderDetails?.length > 0) && (
                      <div className="mt-6 pt-6 border-t border-[#ead9ae]">
                        <p className="font-semibold text-[#1f2a44] mb-4">Items in this order:</p>
                        <div className="space-y-2">
                          {(order.items || order.orderDetails)?.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-[#4d5a76]">
                              <span className="line-clamp-2">{item.product?.name || item.name || "Product"}</span>
                              <span className="font-medium">x{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {isExpanded && (
                      <div className="mt-6 pt-6 border-t border-[#ead9ae] grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-[#5b6780] font-medium">Order Date</p>
                          <p className="text-[#1f2a44]">
                            {order.orderDate ? new Date(order.orderDate).toLocaleString() : "Not available"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[#5b6780] font-medium">Address</p>
                          <p className="text-[#1f2a44]">
                            {formatAddress(order.shippingAddress || order.address)}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="mt-6 flex gap-3 pt-6 border-t border-[#ead9ae]">
                      <button
                        onClick={() => toggleExpanded(order.id)}
                        className="flex-1 rounded-lg border border-[#2b3a5f] bg-[#1f2a44] text-[#f6df9a] px-4 py-2 font-medium hover:bg-[#16203a] transition"
                      >
                        {isExpanded ? "Hide Details" : "View Details"}
                      </button>
                      {(order.orderStatus === "PENDING" || order.orderStatus === "ORDER_FAILED") && order.paymentMethod === "RAZORPAY" ? (
                        <button
                          onClick={() =>
                            navigate("/payment", {
                              state: {
                                orderId: order.id,
                                amount: order.totalAmount,
                              },
                            })
                          }
                          className="flex-1 rounded-lg border border-[#c6a65d] bg-gradient-to-r from-[#f5df9f] to-[#dfbf71] text-[#1f2a44] px-4 py-2 font-medium hover:from-[#f2d78d] hover:to-[#d6b25f] transition"
                        >
                          Pay Now
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white/95 border border-[#e3d2a6] rounded-lg shadow-md">
            <svg className="w-20 h-20 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4m0 0L4 7m16 0l-8 4m8-4v10l-8 4m0-10L4 7m0 0v10l8 4" />
            </svg>
            <h2 className="text-3xl font-bold text-[#1f2a44] mb-2">No Orders Yet</h2>
            <p className="text-[#5b6780] mb-6">You haven't placed any orders. Start shopping to see orders here!</p>
            <a href="/" className="btn btn-primary font-semibold">
              Continue Shopping
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
