import { useEffect, useState } from "react";
import api from "../../api/axios";
import Loader from "../../components/Loader";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/admin/users", { params: { page: 0, size: 50 } });
        const payload = response.data?.data || response.data;
        setUsers(payload?.content || payload || []);
      } catch (err) {
        console.error("Unable to load users:", err);
        setError(err.response?.data?.message || "Unable to load users.");
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1c2742] via-[#223154] to-[#2f446f] text-[#f7e4ac] border-b border-amber-200/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold">Manage Users</h1>
          <p className="text-amber-100/85 mt-2">View and manage registered users</p>
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
        ) : users.length ? (
          <div className="bg-white/95 border border-[#e3d2a6] rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-[#e3d2a6] bg-gradient-to-r from-[#f8eed3] to-[#f4e7c4]">
              <h2 className="text-xl font-bold text-[#1f2a44]">
                Total Users: <span className="text-[#2f446f]">{users.length}</span>
              </h2>
            </div>

            <div className="divide-y divide-[#e3d2a6]">
              {users.map((user) => (
                <div key={user.id} className="px-6 py-4 hover:bg-[#fbf3dd] transition">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#2b3a5f] to-[#1c2742] rounded-full flex items-center justify-center text-[#f7e4ac] font-bold">
                          {(user.username || user.name || "U")[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-[#1f2a44]">
                            {user.username || user.name || "User"}
                          </h3>
                          <p className="text-sm text-[#4d5a76]">{user.email || "No email"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 ml-4">
                      {((Array.isArray(user.roles) && user.roles.length > 0) || user.role) ? (
                        <div className="flex flex-wrap gap-2">
                          {(Array.isArray(user.roles) ? user.roles : [user.role]).filter(Boolean).map((role, idx) => (
                            <span
                              key={idx}
                              className={`text-xs font-semibold px-3 py-1 rounded-full ${
                                role === "ADMIN" || role === "ROLE_ADMIN"
                                  ? "bg-[#f8e6b8] text-[#7b5a11]"
                                  : role === "USER" || role === "ROLE_USER"
                                    ? "bg-[#d9e1f2] text-[#2f446f]"
                                    : "bg-[#eceff5] text-[#4d5a76]"
                              }`}
                            >
                              {role}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#eceff5] text-[#4d5a76]">
                          No roles
                        </span>
                      )}

                      <div className="text-right text-sm text-[#5b6780]">
                        ID: {user.id}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white/95 border border-[#e3d2a6] rounded-lg shadow-md">
            <svg className="w-20 h-20 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20a9 9 0 0118 0" />
            </svg>
            <h2 className="text-3xl font-bold text-[#1f2a44] mb-2">No Users Found</h2>
            <p className="text-[#5b6780]">Users will appear here as they register</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;

