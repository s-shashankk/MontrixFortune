import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import Loader from "../../components/Loader";

const byName = (a, b) => (a.name || "").toLowerCase().localeCompare((b.name || "").toLowerCase());

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  const [newSubNames, setNewSubNames] = useState({});
  const [editingSubId, setEditingSubId] = useState(null);
  const [editSubName, setEditSubName] = useState("");

  const loadAll = async () => {
    try {
      setLoading(true);
      const [categoryResponse, subResponse] = await Promise.all([
        api.get("/api/admin/categories"),
        api.get("/api/admin/sub-categories"),
      ]);
      const categoryPayload = categoryResponse?.data;
      const subPayload = subResponse?.data;
      setCategories(
        [...(Array.isArray(categoryPayload) ? categoryPayload : categoryPayload?.data || [])].sort(byName)
      );
      setSubCategories(
        [...(Array.isArray(subPayload) ? subPayload : subPayload?.data || [])].sort(byName)
      );
    } catch (err) {
      console.error("Unable to load categories:", err);
      setError(err.response?.data?.message || "Unable to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const resetMessages = () => {
    setError("");
    setSuccess("");
  };

  const run = async (action, successMessage, fallbackError) => {
    resetMessages();
    try {
      await action();
      if (successMessage) setSuccess(successMessage);
      await loadAll();
      return true;
    } catch (err) {
      setError(err.response?.data?.message || fallbackError);
      return false;
    }
  };

  // ---- main categories
  const handleCreate = async (e) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    const ok = await run(
      () => api.post("/api/admin/categories", { name, description: "" }),
      `Category "${name}" added.`,
      "Unable to add category."
    );
    if (ok) setNewName("");
  };

  const startEdit = (category) => {
    resetMessages();
    setEditingId(category.id);
    setEditName(category.name || "");
  };

  const handleSave = async (category) => {
    const name = editName.trim();
    if (!name) {
      setError("Category name cannot be empty.");
      return;
    }
    const ok = await run(
      () => api.put(`/api/admin/categories/${category.id}`, { name, description: category.description || "" }),
      "Category renamed. All its products now show the new name.",
      "Unable to rename category."
    );
    if (ok) setEditingId(null);
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Delete the category "${category.name}" and its sub-categories? This cannot be undone.`)) {
      return;
    }
    await run(
      () => api.delete(`/api/admin/categories/${category.id}`),
      `Category "${category.name}" deleted.`,
      "Unable to delete category."
    );
  };

  // ---- sub-categories
  const handleAddSub = async (category) => {
    const name = (newSubNames[category.id] || "").trim();
    if (!name) return;
    const ok = await run(
      () => api.post("/api/admin/sub-categories", { name, categoryId: category.id }),
      `Sub-category "${name}" added to ${category.name}.`,
      "Unable to add sub-category."
    );
    if (ok) setNewSubNames((prev) => ({ ...prev, [category.id]: "" }));
  };

  const startEditSub = (sub) => {
    resetMessages();
    setEditingSubId(sub.id);
    setEditSubName(sub.name || "");
  };

  const handleSaveSub = async (sub) => {
    const name = editSubName.trim();
    if (!name) {
      setError("Sub-category name cannot be empty.");
      return;
    }
    const ok = await run(
      () => api.put(`/api/admin/sub-categories/${sub.id}`, { name }),
      "Sub-category renamed.",
      "Unable to rename sub-category."
    );
    if (ok) setEditingSubId(null);
  };

  const handleDeleteSub = async (sub) => {
    if (
      !window.confirm(
        `Delete the sub-category "${sub.name}"? Products in it stay in "${sub.categoryName}" but will have no sub-category.`
      )
    ) {
      return;
    }
    await run(
      () => api.delete(`/api/admin/sub-categories/${sub.id}`),
      `Sub-category "${sub.name}" deleted.`,
      "Unable to delete sub-category."
    );
  };

  return (
    <div className="min-h-screen bg-transparent">
      <div className="bg-gradient-to-r from-[#1c2742] via-[#223154] to-[#2f446f] text-[#f7e4ac] border-b border-amber-200/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold">Manage Categories</h1>
          <p className="text-amber-100/85 mt-2">Add, rename or delete categories and their sub-categories</p>
          <Link to="/admin/products" className="mt-4 inline-block rounded-lg border border-amber-200/50 px-4 py-2 text-sm font-semibold text-[#f7e4ac] hover:bg-white/10 transition">
            ← Back to products
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">{success}</div>
        )}

        <form onSubmit={handleCreate} className="bg-white/95 border border-[#e3d2a6] rounded-lg shadow-md p-6 mb-8 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New category name, e.g., Chairs"
            className="input"
            required
          />
          <button type="submit" className="rounded-lg border border-[#c6a65d] bg-gradient-to-r from-[#f5df9f] to-[#dfbf71] text-[#1f2a44] px-5 py-2 font-semibold whitespace-nowrap">
            + Add category
          </button>
        </form>

        {loading ? (
          <div className="p-8"><Loader /></div>
        ) : categories.length === 0 ? (
          <p className="p-8 text-center text-slate-500">No categories yet.</p>
        ) : (
          <div className="space-y-5">
            <p className="text-sm text-[#4d5a76]">
              A category can only be deleted when it has no products. Deleting a sub-category keeps its products.
            </p>

            {categories.map((category) => {
              const subs = subCategories.filter((sub) => sub.categoryId === category.id);
              return (
                <div key={category.id} className="bg-white/95 border border-[#e3d2a6] rounded-lg shadow-md overflow-hidden">
                  {/* Category header */}
                  <div className="p-4 bg-gradient-to-r from-[#f8eed3] to-[#f4e7c4] flex flex-col sm:flex-row sm:items-center gap-3">
                    {editingId === category.id ? (
                      <>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="input"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button onClick={() => handleSave(category)} className="px-4 py-2 rounded-lg bg-[#1f2a44] text-[#f6df9a] text-sm font-semibold">
                            Save
                          </button>
                          <button onClick={() => setEditingId(null)} className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-sm">
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <h2 className="flex-1 text-xl font-bold text-[#1f2a44]">{category.name}</h2>
                        <div className="flex gap-2">
                          <button onClick={() => startEdit(category)} className="px-3 py-1 text-sm font-medium text-[#1f2a44] hover:bg-white/70 rounded-lg transition">
                            ✏️ Rename
                          </button>
                          <button onClick={() => handleDelete(category)} className="px-3 py-1 text-sm font-medium text-[#8c2f39] hover:bg-[#fde8ea] rounded-lg transition">
                            🗑️ Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Sub-categories */}
                  <div className="p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                      Sub-categories ({subs.length})
                    </p>

                    {subs.length === 0 ? (
                      <p className="text-sm text-slate-500 mb-3">No sub-categories yet.</p>
                    ) : (
                      <ul className="mb-3 divide-y divide-[#efe3c3] rounded-lg border border-[#efe3c3]">
                        {subs.map((sub) => (
                          <li key={sub.id} className="p-2 flex flex-col sm:flex-row sm:items-center gap-2">
                            {editingSubId === sub.id ? (
                              <>
                                <input
                                  type="text"
                                  value={editSubName}
                                  onChange={(e) => setEditSubName(e.target.value)}
                                  className="input"
                                  autoFocus
                                />
                                <div className="flex gap-2">
                                  <button onClick={() => handleSaveSub(sub)} className="px-3 py-1.5 rounded-lg bg-[#1f2a44] text-[#f6df9a] text-sm font-semibold">
                                    Save
                                  </button>
                                  <button onClick={() => setEditingSubId(null)} className="px-3 py-1.5 rounded-lg border border-slate-300 text-sm">
                                    Cancel
                                  </button>
                                </div>
                              </>
                            ) : (
                              <>
                                <span className="flex-1 pl-1 text-slate-800">{sub.name}</span>
                                <div className="flex gap-1">
                                  <button onClick={() => startEditSub(sub)} className="px-2 py-1 text-sm text-[#1f2a44] hover:bg-[#f8eed3] rounded-lg transition">
                                    ✏️ Rename
                                  </button>
                                  <button onClick={() => handleDeleteSub(sub)} className="px-2 py-1 text-sm text-[#8c2f39] hover:bg-[#fde8ea] rounded-lg transition">
                                    🗑️ Delete
                                  </button>
                                </div>
                              </>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={newSubNames[category.id] || ""}
                        onChange={(e) => setNewSubNames((prev) => ({ ...prev, [category.id]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddSub(category);
                          }
                        }}
                        placeholder={`Add a sub-category to ${category.name}`}
                        className="input"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddSub(category)}
                        className="rounded-lg border border-[#c6a65d] bg-[#f8eed3] px-4 py-2 text-sm font-semibold text-[#1f2a44] whitespace-nowrap hover:bg-[#f2dfa8]"
                      >
                        + Add sub-category
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCategories;
