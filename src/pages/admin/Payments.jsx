import { useEffect, useState } from "react";
import { getAllPayments } from "../../api/paymentApi";
import Loader from "../../components/Loader";

const resolveCustomerName = (payment) => {
  if (payment?.customerName && payment.customerName.trim()) {
    return payment.customerName;
  }

  if (payment?.customerEmail && payment.customerEmail.includes("@")) {
    return payment.customerEmail.split("@")[0];
  }

  return "Customer";
};

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPayments = async () => {
      try {
        const response = await getAllPayments();
        setPayments(response.data || []);
      } catch {
        setError("Unable to load payments.");
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1c2742] via-[#223154] to-[#2f446f] text-[#f7e4ac] border-b border-amber-200/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold">Manage Payments</h1>
          <p className="text-amber-100/85 mt-2">View and verify payment transactions</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {payments.length ? (
          <div className="bg-white/95 border border-[#e3d2a6] rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-[#e3d2a6] bg-gradient-to-r from-[#f8eed3] to-[#f4e7c4]">
              <h2 className="text-xl font-bold text-[#1f2a44]">
                Total Payments: <span className="text-[#2f446f]">{payments.length}</span>
              </h2>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#f8f2df] border-b border-[#e3d2a6]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#4d5a76] uppercase tracking-wider">
                      Payment ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#4d5a76] uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#4d5a76] uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#4d5a76] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#4d5a76] uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e3d2a6]">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-[#fbf3dd] transition">
                      <td className="px-6 py-4 text-sm font-medium text-[#1f2a44]">
                        {payment.razorpayPaymentId || payment.id}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <p className="font-semibold text-[#1f2a44]">{resolveCustomerName(payment)}</p>
                        <p className="text-xs text-[#4d5a76] mt-1">{payment.customerEmail || "-"}</p>
                        <p className="text-xs text-[#4d5a76] mt-1">{payment.customerPhone || "-"}</p>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="font-semibold text-[#2f446f]">
                          ₹{payment.amount ? payment.amount.toFixed(2) : "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            payment.paymentStatus === "COMPLETED" || payment.paymentStatus === "SUCCESS"
                              ? "bg-green-100 text-green-700"
                              : payment.paymentStatus === "PENDING"
                                ? "bg-yellow-100 text-yellow-700"
                                : payment.paymentStatus === "FAILED"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-[#eceff5] text-[#4d5a76]"
                          }`}
                        >
                          {payment.paymentStatus || "Unknown"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#4d5a76]">
                        {payment.paymentDate
                          ? new Date(payment.paymentDate).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-[#e3d2a6]">
              {payments.map((payment) => (
                <div key={payment.id} className="p-4 hover:bg-[#fbf3dd] transition">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-sm font-medium text-[#5b6780]">Payment ID</p>
                      <p className="text-sm font-bold text-[#1f2a44]">{payment.razorpayPaymentId || payment.id}</p>
                      <p className="text-xs font-semibold text-[#1f2a44] mt-2">{resolveCustomerName(payment)}</p>
                      <p className="text-xs text-[#4d5a76] mt-1">{payment.customerEmail || "-"}</p>
                    </div>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        payment.paymentStatus === "COMPLETED" || payment.paymentStatus === "SUCCESS"
                          ? "bg-green-100 text-green-700"
                          : payment.paymentStatus === "PENDING"
                            ? "bg-yellow-100 text-yellow-700"
                            : payment.paymentStatus === "FAILED"
                              ? "bg-red-100 text-red-700"
                              : "bg-[#eceff5] text-[#4d5a76]"
                      }`}
                    >
                      {payment.paymentStatus || "Unknown"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-[#5b6780]">Amount</p>
                      <p className="font-semibold text-[#2f446f]">₹{payment.amount ? payment.amount.toFixed(2) : "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#5b6780]">Date</p>
                      <p className="font-semibold text-[#1f2a44]">
                        {payment.paymentDate
                          ? new Date(payment.paymentDate).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white/95 border border-[#e3d2a6] rounded-lg shadow-md">
            <svg className="w-20 h-20 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10.5v6m0 0v3m0-3h18m0 0v3m0-3V10.5M9 7h1m4 0h1M9 17h1m4 0h1" />
            </svg>
            <h2 className="text-3xl font-bold text-[#1f2a44] mb-2">No Payments Found</h2>
            <p className="text-[#5b6780]">Payment transactions will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payments;
