import { Fragment, useEffect, useMemo, useState } from "react";
import {
  getAdminOrders,
  updateAdminOrderPaymentCollection,
  updateAdminOrderStatus,
} from "../../api/orderApi";
import Loader from "../../components/Loader";
import { useToast } from "../../context/ToastContext";
import { formatINR } from "../../utils/currency";

const getStatusMeta = (status) => {
  switch (status) {
    case "CONFIRMED":
      return { label: "CONFIRMED", classes: "bg-indigo-100 text-indigo-700" };
    case "PACKING":
      return { label: "PACKING", classes: "bg-amber-100 text-amber-700" };
    case "OUT_FOR_SHIPMENT":
    case "SHIPPED":
      return { label: "OUT FOR SHIPMENT", classes: "bg-sky-100 text-sky-700" };
    case "DELIVERED":
      return { label: "DELIVERED", classes: "bg-emerald-100 text-emerald-700" };
    case "ORDER_FAILED":
      return { label: "ORDER FAILED", classes: "bg-red-100 text-red-700" };
    case "CANCELLED":
      return { label: "CANCELLED", classes: "bg-red-100 text-red-700" };
    case "PENDING":
    default:
      return { label: "PENDING", classes: "bg-yellow-100 text-yellow-700" };
  }
};

const getPaymentDisplay = (order) => {
  if (order.paymentMethod === "RAZORPAY") {
    if (order.gatewayPaymentStatus === "SUCCESS" || order.paymentCollectionStatus === "PAID") {
      return { label: "PAID", classes: "bg-green-100 text-green-700" };
    }

    if (order.gatewayPaymentStatus === "FAILED") {
      return { label: "FAILED", classes: "bg-red-100 text-red-700" };
    }

    return { label: "PENDING", classes: "bg-yellow-100 text-yellow-700" };
  }

  if (order.paymentCollectionStatus === "PAID") {
    return { label: "Success", classes: "bg-green-100 text-green-700" };
  }

  return { label: "COD", classes: "bg-amber-100 text-amber-700" };
};

const formatDateTime = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const joinAddressLine = (parts) => parts.filter(Boolean).join(", ") || "-";

const sortOrdersNewestFirst = (list) =>
  [...list].sort((a, b) => {
    const dateA = a?.orderDate ? new Date(a.orderDate).getTime() : 0;
    const dateB = b?.orderDate ? new Date(b.orderDate).getTime() : 0;

    if (dateA !== dateB) {
      return dateB - dateA;
    }

    return (Number(b?.id) || 0) - (Number(a?.id) || 0);
  });

const getImageSrc = (value) => {
  if (!value) {
    return "https://via.placeholder.com/40x40?text=No+Img";
  }

  if (value.startsWith("http") || value.startsWith("data:image")) {
    return value;
  }

  return value;
};

const statusActions = [
  {
    status: "PACKING",
    label: "Mark Packing",
    icon: "📦",
    activeClasses: "bg-[#f8eed3] text-[#7b5a11] hover:bg-[#f3e2ba]",
  },
  {
    status: "OUT_FOR_SHIPMENT",
    label: "Out for Shipment",
    icon: "🚚",
    activeClasses: "bg-[#d9e1f2] text-[#2f446f] hover:bg-[#c9d4eb]",
  },
  {
    status: "DELIVERED",
    label: "Mark Delivered",
    icon: "✓",
    activeClasses: "bg-[#e7f3e6] text-[#2f6f44] hover:bg-[#d9ecd8]",
  },
];

const isStatusActive = (currentStatus, actionStatus) => {
  if (actionStatus === "OUT_FOR_SHIPMENT") {
    return currentStatus === "OUT_FOR_SHIPMENT" || currentStatus === "SHIPPED";
  }

  return currentStatus === actionStatus;
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoadingKey, setActionLoadingKey] = useState("");
  const { showToast } = useToast();

  const loadOrders = async () => {
    try {
      setLoading(true);
      const payload = await getAdminOrders(0, 30);
      const rawOrders = payload?.content || payload || [];
      setOrders(sortOrdersNewestFirst(rawOrders));
    } catch (err) {
      console.error("Unable to load orders:", err);
      setError(err.response?.data?.message || "Unable to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const toggleOrderDetails = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const handleUpdate = async (orderId, status) => {
    try {
      setActionLoadingKey(`${orderId}:${status}`);
      const updatedOrder = await updateAdminOrderStatus(orderId, status);
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? { ...order, ...updatedOrder } : order))
      );

      showToast(`Order #${orderId} updated to ${status.replaceAll("_", " ")}.`, "success");
    } catch (err) {
      console.error("Unable to update order status:", err);
      showToast(err.response?.data?.message || "Unable to update order status.", "error");
    } finally {
      setActionLoadingKey("");
    }
  };

  const handlePaymentCollectionUpdate = async (orderId, paymentState) => {
    try {
      setActionLoadingKey(`${orderId}:payment:${paymentState}`);
      const updatedOrder = await updateAdminOrderPaymentCollection(orderId, paymentState);
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? { ...order, ...updatedOrder } : order))
      );
      showToast(`Order #${orderId} payment state updated to ${paymentState}.`, "success");
    } catch (err) {
      console.error("Unable to update payment collection status:", err);
      showToast(err.response?.data?.message || "Unable to update payment state.", "error");
    } finally {
      setActionLoadingKey("");
    }
  };

  const orderCount = useMemo(() => orders.length, [orders.length]);

  const renderStatusActions = (orderId, status) => (
    <div className="flex flex-col gap-2 min-w-max">
      {statusActions.map((action) => {
        const loadingKey = `${orderId}:${action.status}`;
        const active = isStatusActive(status, action.status);

        return (
          <button
            key={action.status}
            onClick={() => handleUpdate(orderId, action.status)}
            disabled={actionLoadingKey === loadingKey}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed ${
              active
                ? action.activeClasses
                : "bg-[#eceff5] text-[#4d5a76] hover:bg-[#dfe5f0]"
            }`}
          >
            {actionLoadingKey === loadingKey ? "Updating..." : `${action.icon} ${action.label}`}
          </button>
        );
      })}

    </div>
  );

  const renderCustomerLocationDetails = (order) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 rounded-lg border border-[#e3d2a6] bg-[#f8f2df]">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[#5b6780]">Customer</p>
        <p className="text-sm font-semibold text-[#1f2a44] mt-1">{order.customerName || order.fullName || "Unknown"}</p>
        <p className="text-xs text-[#4d5a76] mt-1">{order.customerEmail || "Email not available"}</p>
        <p className="text-xs text-[#4d5a76] mt-1">{order.customerPhone || "Phone not available"}</p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[#5b6780]">Location</p>
        <p className="text-sm font-semibold text-[#1f2a44] mt-1">{order.fullName || "-"}</p>
        <p className="text-xs text-[#4d5a76] mt-1">{order.streetAddress || "-"}</p>
        <p className="text-xs text-[#4d5a76] mt-1">{joinAddressLine([order.city, order.state, order.postalCode])}</p>
        <p className="text-xs text-[#4d5a76] mt-1">{order.country || "-"}</p>
      </div>
    </div>
  );

  const renderItemsPreview = (items = []) => {
    if (!items.length) {
      return <p className="text-xs text-slate-500">No items</p>;
    }

    return (
      <div className="space-y-2 min-w-[220px]">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2">
            <img
              src={getImageSrc(item.imageUrl)}
              alt={item.name || "Item"}
              className="w-9 h-9 rounded-md object-cover border border-slate-200 bg-slate-100"
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">{item.name || "Unknown Item"}</p>
              <p className="text-[11px] text-slate-600">Qty: {item.quantity ?? 0}</p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderPaymentControls = (order) => {
    const paymentState = getPaymentDisplay(order);
    const amountPaid = order.paymentCollectionStatus === "PAID" ? order.totalAmount : 0;

    if (order.paymentMethod === "RAZORPAY") {
      return (
        <div>
          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${paymentState.classes}`}>
            {paymentState.label}
          </span>
          <p className="text-xs text-slate-600 mt-1">Amount Paid: {formatINR(amountPaid)}</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${paymentState.classes}`}>
          {paymentState.label}
        </span>
        <p className="text-xs text-slate-600">Amount Paid: {formatINR(amountPaid)}</p>
        <div className="flex gap-2">
          <button
            onClick={() => handlePaymentCollectionUpdate(order.id, "COD")}
            disabled={actionLoadingKey === `${order.id}:payment:COD`}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition disabled:opacity-60 ${
              order.paymentCollectionStatus === "COD"
                ? "bg-amber-100 text-amber-700"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            COD
          </button>
          <button
            onClick={() => handlePaymentCollectionUpdate(order.id, "PAID")}
            disabled={actionLoadingKey === `${order.id}:payment:PAID`}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition disabled:opacity-60 ${
              order.paymentCollectionStatus === "PAID"
                ? "bg-green-100 text-green-700"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Paid
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-transparent">
      <div className="bg-gradient-to-r from-[#1c2742] via-[#223154] to-[#2f446f] text-[#f7e4ac] border-b border-amber-200/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold">Manage Orders</h1>
          <p className="text-amber-100/85 mt-2">Track, review, and fulfill customer orders</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <Loader />
        ) : orders.length ? (
          <div className="bg-white/95 border border-[#e3d2a6] rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-[#e3d2a6] bg-gradient-to-r from-[#f8eed3] to-[#f4e7c4]">
              <h2 className="text-xl font-bold text-[#1f2a44]">
                Total Orders: <span className="text-[#2f446f]">{orderCount}</span>
              </h2>
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#f8f2df] border-b border-[#e3d2a6]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#4d5a76] uppercase tracking-wider">Order</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#4d5a76] uppercase tracking-wider">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#4d5a76] uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#4d5a76] uppercase tracking-wider">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#4d5a76] uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#4d5a76] uppercase tracking-wider">Shipment Actions</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#4d5a76] uppercase tracking-wider">View Details</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#e3d2a6]">
                  {orders.map((order) => {
                    const status = order.orderStatus || order.status;
                    const statusMeta = getStatusMeta(status);
                    const isExpanded = !!expandedOrders[order.id];

                    return (
                      <Fragment key={order.id}>
                        <tr className="hover:bg-[#fbf3dd] transition align-top">
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-[#1f2a44]">Order #{order.id}</p>
                            <p className="text-xs text-[#4d5a76] mt-1">{formatDateTime(order.orderDate)}</p>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-700">{renderItemsPreview(order.items || [])}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-[#1f2a44]">{formatINR(order.totalAmount)}</td>
                          <td className="px-6 py-4 text-sm text-slate-700 min-w-[170px]">
                            <p className="font-medium text-[#1f2a44] mb-1">{order.paymentMethod || "-"}</p>
                            {renderPaymentControls(order)}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusMeta.classes}`}>
                              {statusMeta.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">{renderStatusActions(order.id, status)}</td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => toggleOrderDetails(order.id)}
                              className="px-3 py-1.5 text-xs font-medium rounded-md bg-[#f8eed3] text-[#1f2a44] hover:bg-[#f1dfb0] transition"
                            >
                              {isExpanded ? "Hide" : "View"}
                            </button>
                          </td>
                        </tr>

                        {isExpanded ? (
                          <tr>
                            <td colSpan={7} className="px-6 pb-4 pt-1 bg-white">
                              {renderCustomerLocationDetails(order)}
                            </td>
                          </tr>
                        ) : null}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-slate-200">
              {orders.map((order) => {
                const status = order.orderStatus || order.status;
                const statusMeta = getStatusMeta(status);

                return (
                  <div key={order.id} className="p-4 hover:bg-slate-50 transition">
                    <div className="flex justify-between items-start gap-3 mb-3">
                      <div>
                        <p className="text-sm font-bold text-slate-900">Order #{order.id}</p>
                        <p className="text-xs text-slate-600 mt-1">{formatDateTime(order.orderDate)}</p>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusMeta.classes}`}>
                        {statusMeta.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                      <div>
                        <p className="text-slate-600">Total</p>
                        <p className="font-semibold text-slate-900">{formatINR(order.totalAmount)}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">View Details</p>
                        <button
                          onClick={() => toggleOrderDetails(order.id)}
                          className="mt-1 px-3 py-1.5 text-xs font-medium rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition"
                        >
                          {expandedOrders[order.id] ? "Hide" : "View"}
                        </button>
                      </div>
                      <div>
                        <p className="text-slate-600">Status</p>
                        <span className={`inline-flex mt-1 items-center px-3 py-1 rounded-full text-xs font-semibold ${statusMeta.classes}`}>
                          {statusMeta.label}
                        </span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-xs text-slate-600 mb-2">Items</p>
                      {renderItemsPreview(order.items || [])}
                    </div>

                    <div className="mb-3">
                      <p className="text-xs text-slate-600">Payment</p>
                      <p className="text-sm font-medium text-slate-900 mt-1 mb-2">{order.paymentMethod || "-"}</p>
                      {renderPaymentControls(order)}
                    </div>

                    <div className="mb-3">
                      {renderStatusActions(order.id, status)}
                    </div>

                    {expandedOrders[order.id] ? (
                      <div className="mt-3">
                        {renderCustomerLocationDetails(order)}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow-md">
            <svg className="w-20 h-20 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4m0 0L4 7m16 0l-8 4m8-4v10l-8 4m0-10L4 7m0 0v10l8 4" />
            </svg>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">No Orders Found</h2>
            <p className="text-slate-600">Customer orders will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
