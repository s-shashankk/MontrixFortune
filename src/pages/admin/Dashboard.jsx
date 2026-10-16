import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import Loader from "../../components/Loader";

const Dashboard = () => {
  const [stats, setStats] = useState({ users: 0, orders: 0, products: 0, payments: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const [usersRes, ordersRes, productsRes, paymentsRes] = await Promise.all([
          api.get("/api/admin/users", { params: { page: 0, size: 1 } }),
          api.get("/api/admin/orders", { params: { page: 0, size: 1 } }),
          api.get("/api/admin/products"),
          api.get("/api/admin/payments", { params: { page: 0, size: 1 } }),
        ]);

        const usersData = usersRes.data?.data || usersRes.data;
        const ordersData = ordersRes.data?.data || ordersRes.data;
        const productsData = productsRes.data?.data || productsRes.data;
        const paymentsData = paymentsRes.data?.data || paymentsRes.data;

        setStats({
          users: usersData?.totalElements ?? usersData?.content?.length ?? 0,
          orders: ordersData?.totalElements ?? ordersData?.content?.length ?? 0,
          products: productsData?.length ?? 0,
          payments: paymentsData?.totalElements ?? paymentsData?.content?.length ?? 0,
        });
      } catch (err) {
        console.error("Unable to load dashboard stats:", err);
        setError(err.response?.data?.message || "Unable to load dashboard stats.");
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1b2743] via-[#223256] to-[#2b416c] text-[#f8e6b5] border-b border-amber-200/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <p className="text-amber-100/85 mt-2">Manage your furniture store with precision and style</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <Link
            to="/admin/products"
            className="bg-white/95 rounded-xl shadow-md p-6 hover:shadow-xl transition border border-[#e6d8b4] hover:border-[#c7ab63]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#5b6780] text-sm font-medium">Manage Products</p>
                <p className="text-xl font-bold text-[#1f2a44] mt-1">Add • Edit • Delete</p>
              </div>
              <span className="text-4xl">📦</span>
            </div>
          </Link>

          <Link
            to="/admin/users"
            className="bg-white/95 rounded-xl shadow-md p-6 hover:shadow-xl transition border border-[#e6d8b4] hover:border-[#c7ab63]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#5b6780] text-sm font-medium">Manage Users</p>
                <p className="text-xl font-bold text-[#1f2a44] mt-1">View • Block</p>
              </div>
              <span className="text-4xl">👥</span>
            </div>
          </Link>

          <Link
            to="/admin/orders"
            className="bg-white/95 rounded-xl shadow-md p-6 hover:shadow-xl transition border border-[#e6d8b4] hover:border-[#c7ab63]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#5b6780] text-sm font-medium">Manage Orders</p>
                <p className="text-xl font-bold text-[#1f2a44] mt-1">Track • Update</p>
              </div>
              <span className="text-4xl">📋</span>
            </div>
          </Link>

          <Link
            to="/admin/payments"
            className="bg-white/95 rounded-xl shadow-md p-6 hover:shadow-xl transition border border-[#e6d8b4] hover:border-[#c7ab63]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#5b6780] text-sm font-medium">Manage Payments</p>
                <p className="text-xl font-bold text-[#1f2a44] mt-1">View • Verify</p>
              </div>
              <span className="text-4xl">💳</span>
            </div>
          </Link>

          <Link
            to="/admin/hero-slides"
            className="bg-white/95 rounded-xl shadow-md p-6 hover:shadow-xl transition border border-[#e6d8b4] hover:border-[#c7ab63]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#5b6780] text-sm font-medium">Hero Banners</p>
                <p className="text-xl font-bold text-[#1f2a44] mt-1">Slides • Text • Order</p>
              </div>
              <span className="text-4xl">🖼️</span>
            </div>
          </Link>

          <Link
            to="/admin/projects"
            className="bg-white/95 rounded-xl shadow-md p-6 hover:shadow-xl transition border border-[#e6d8b4] hover:border-[#c7ab63]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#5b6780] text-sm font-medium">Our Projects</p>
                <p className="text-xl font-bold text-[#1f2a44] mt-1">Photos • Story • Order</p>
              </div>
              <span className="text-4xl">🏠</span>
            </div>
          </Link>
        </div>

        {/* Statistics */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <Loader />
        ) : (
          <div className="bg-white/95 border border-[#e3d2a6] rounded-xl shadow-md p-8">
            <h2 className="text-3xl font-bold text-[#1f2a44] mb-6">Statistics Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Users Card */}
              <div className="bg-gradient-to-br from-[#f8eed2] to-[#efe1bc] rounded-xl p-6 border border-[#dbc48e]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#5b6780] text-sm font-semibold">Total Users</p>
                    <p className="text-4xl font-bold text-[#1f2a44] mt-2">{stats.users}</p>
                  </div>
                  <span className="text-5xl opacity-20">👥</span>
                </div>
                <p className="text-[#4b5872] text-sm mt-4">Active members</p>
              </div>

              {/* Orders Card */}
              <div className="bg-gradient-to-br from-[#f8eed2] to-[#efe1bc] rounded-xl p-6 border border-[#dbc48e]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#5b6780] text-sm font-semibold">Total Orders</p>
                    <p className="text-4xl font-bold text-[#1f2a44] mt-2">{stats.orders}</p>
                  </div>
                  <span className="text-5xl opacity-20">📋</span>
                </div>
                <p className="text-[#4b5872] text-sm mt-4">Placed orders</p>
              </div>

              {/* Products Card */}
              <div className="bg-gradient-to-br from-[#f8eed2] to-[#efe1bc] rounded-xl p-6 border border-[#dbc48e]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#5b6780] text-sm font-semibold">Total Products</p>
                    <p className="text-4xl font-bold text-[#1f2a44] mt-2">{stats.products}</p>
                  </div>
                  <span className="text-5xl opacity-20">📦</span>
                </div>
                <p className="text-[#4b5872] text-sm mt-4">In inventory</p>
              </div>

              {/* Payments Card */}
              <div className="bg-gradient-to-br from-[#f8eed2] to-[#efe1bc] rounded-xl p-6 border border-[#dbc48e]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#5b6780] text-sm font-semibold">Total Payments</p>
                    <p className="text-4xl font-bold text-[#1f2a44] mt-2">{stats.payments}</p>
                  </div>
                  <span className="text-5xl opacity-20">💳</span>
                </div>
                <p className="text-[#4b5872] text-sm mt-4">Processed</p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="mt-8 bg-white/95 border border-[#e3d2a6] rounded-xl shadow-md p-8">
          <h2 className="text-3xl font-bold text-[#1f2a44] mb-4">Quick Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-r from-[#f7edd2] to-[#f3e7c7] rounded-lg border border-[#dcc89a]">
              <p className="font-semibold text-[#1f2a44]">📊 Track Performance</p>
              <p className="text-[#4d5a76] text-sm mt-1">Monitor sales trends and customer behavior</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-[#f7edd2] to-[#f3e7c7] rounded-lg border border-[#dcc89a]">
              <p className="font-semibold text-[#1f2a44]">🎯 Inventory Management</p>
              <p className="text-[#4d5a76] text-sm mt-1">Keep track of product stock levels</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-[#f7edd2] to-[#f3e7c7] rounded-lg border border-[#dcc89a]">
              <p className="font-semibold text-[#1f2a44]">💬 Customer Support</p>
              <p className="text-[#4d5a76] text-sm mt-1">View and manage customer inquiries</p>
            </div>
            <div className="p-4 bg-gradient-to-r from-[#f7edd2] to-[#f3e7c7] rounded-lg border border-[#dcc89a]">
              <p className="font-semibold text-[#1f2a44]">📈 Revenue Growth</p>
              <p className="text-[#4d5a76] text-sm mt-1">Analyze payment and order data</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

