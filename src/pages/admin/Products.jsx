import { useEffect, useState } from "react";
import api from "../../api/axios";
import Loader from "../../components/Loader";
import { formatINR } from "../../utils/currency";

const MAX_IMAGE_DIMENSION = 1200;
const MAX_IMAGE_DATA_URL_LENGTH = 350000;

const emptyForm = {
  name: "",
  description: "",
  price: "",
  stockQuantity: "",
  imageUrl: "",
  categoryId: "",
  newCategoryName: "",
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [categoryMode, setCategoryMode] = useState("existing");
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/admin/products");
      const payload = response?.data;
      const list = Array.isArray(payload)
        ? payload
        : payload?.data || payload?.content || [];
      setProducts(sortProducts(list));
    } catch (err) {
      console.error("Unable to load products:", err);
      setError(err.response?.data?.message || "Unable to load products.");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await api.get("/api/admin/categories");
      const payload = response?.data;
      const list = Array.isArray(payload)
        ? payload
        : payload?.data || payload?.content || [];
      setCategories(sortCategories(list));
    } catch (err) {
      console.error("Unable to load categories:", err);
      setError(err.response?.data?.message || "Unable to load categories.");
    }
  };

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setEditing(null);
    setCategoryMode("existing");
    setForm(emptyForm);
  };

  const createCategoryIfNeeded = async () => {
    if (categoryMode !== "new") {
      const parsedCategoryId = Number(form.categoryId);
      if (!Number.isFinite(parsedCategoryId) || parsedCategoryId <= 0) {
        throw new Error("Please select a valid category.");
      }

      return parsedCategoryId;
    }

    const newCategoryName = form.newCategoryName.trim();
    if (!newCategoryName) {
      throw new Error("Please enter a category name.");
    }

    const existingCategory = categories.find(
      (category) => category.name?.trim().toLowerCase() === newCategoryName.toLowerCase()
    );

    if (existingCategory) {
      return existingCategory.id;
    }

    const response = await api.post("/api/admin/categories", {
      name: newCategoryName,
      description: "",
    });
    const createdCategory = response?.data?.data || response?.data;

    if (!createdCategory?.id) {
      throw new Error("Unable to create category.");
    }

    setCategories((currentCategories) =>
      sortCategories([...currentCategories, createdCategory])
    );

    return createdCategory.id;
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    compressImageFile(file)
      .then((imageUrl) => {
        setForm((prev) => ({ ...prev, imageUrl }));
      })
      .catch((uploadError) => {
        console.error("Unable to process image:", uploadError);
        setError(uploadError.message || "Unable to process image.");
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      const resolvedCategoryId = await createCategoryIfNeeded();

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        stockQuantity: Number(form.stockQuantity),
        imageUrl: form.imageUrl,
        categoryId: resolvedCategoryId,
      };

      if (editing) {
        await api.put(`/api/admin/products/${editing.id}`, payload);
      } else {
        await api.post("/api/admin/products", payload);
      }

      resetForm();
      await loadProducts();
    } catch (err) {
      console.error("Unable to save product:", err);
      setError(err.response?.data?.message || err.message || "Unable to save product.");
    }
  };

  const handleEdit = (product) => {
    setEditing(product);
    setCategoryMode("existing");
    setForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price?.toString() || "",
      stockQuantity: product.stockQuantity?.toString() || "",
      imageUrl: product.imageUrl || "",
      categoryId: product.category?.id?.toString() || product.category || "",
      newCategoryName: "",
    });
  };

  const handleDelete = async (id) => {
    try {
      setError("");
      await api.delete(`/api/admin/products/${id}`);
      if (editing?.id === id) {
        resetForm();
      }
      await loadProducts();
    } catch (err) {
      console.error("Unable to delete product:", err);
      setError(err.response?.data?.message || "Unable to delete product.");
    }
  };

  const groupedProducts = groupProductsByCategory(products);

  const scrollToProductForm = () => {
    const formElement = document.getElementById("admin-product-form");
    if (!formElement) {
      return;
    }

    formElement.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1c2742] via-[#223154] to-[#2f446f] text-[#f7e4ac] border-b border-amber-200/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold">Manage Products</h1>
          <p className="text-amber-100/85 mt-2">Create, update, and manage the product catalog</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Product Form - Left Side */}
          <div className="lg:col-span-2" id="admin-product-form">
            <div className="bg-white/95 border border-[#e3d2a6] rounded-lg shadow-md p-8 sticky top-20">
              <h2 className="text-2xl font-bold text-[#1f2a44] mb-6">
                {editing ? "Edit Product" : "Add New Product"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="form-label">Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Modern Sofa"
                    className="input"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="form-label">Category *</label>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <button
                      type="button"
                      onClick={() => setCategoryMode("existing")}
                      className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                        categoryMode === "existing"
                          ? "border-[#2b3a5f] bg-[#e7ecf6] text-[#1f2a44]"
                          : "border-slate-200 text-slate-600 hover:border-[#d6b25f]"
                      }`}
                    >
                      Choose Existing
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategoryMode("new")}
                      className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                        categoryMode === "new"
                          ? "border-[#c6a65d] bg-[#f8eed3] text-[#1f2a44]"
                          : "border-slate-200 text-slate-600 hover:border-[#d6b25f]"
                      }`}
                    >
                      Add New Category
                    </button>
                  </div>

                  {categoryMode === "existing" ? (
                    <select
                      name="categoryId"
                      value={form.categoryId}
                      onChange={handleChange}
                      required
                      className="input"
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      name="newCategoryName"
                      value={form.newCategoryName}
                      onChange={handleChange}
                      placeholder="e.g., Recliners"
                      required
                      className="input"
                    />
                  )}

                  <p className="mt-2 text-xs text-slate-500">
                    {categoryMode === "existing"
                      ? "Pick one of the existing categories for this product."
                      : "Type a new category name to create it and assign it to this product."}
                  </p>
                </div>

                {/* Price */}
                <div>
                  <label className="form-label">Price ($) *</label>
                  <input
                    type="number"
                    name="price"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange}
                    required
                    placeholder="0.00"
                    className="input"
                  />
                </div>

                {/* Stock Quantity */}
                <div>
                  <label className="form-label">Stock Quantity *</label>
                  <input
                    type="number"
                    name="stockQuantity"
                    value={form.stockQuantity}
                    onChange={handleChange}
                    required
                    placeholder="0"
                    className="input"
                  />
                </div>

                {/* Image File Upload */}
                <div>
                  <label className="form-label">Upload Image</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center cursor-pointer hover:border-[#d6b25f] hover:bg-[#f8eed3] transition">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-input"
                    />
                    <label htmlFor="file-input" className="cursor-pointer">
                      <div className="text-[#2f446f]">
                        <div>📸 Click to upload or drag & drop</div>
                        <p className="text-xs text-slate-500 mt-1">
                          PNG, JPG, GIF up to 10MB. Large images are resized automatically.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Image Preview */}
                {form.imageUrl && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-slate-700 mb-2">Preview:</p>
                    <img
                      src={form.imageUrl}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border border-slate-200"
                    />
                  </div>
                )}

                {/* Image URL */}
                <div>
                  <label className="form-label">Image URL (Optional)</label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={form.imageUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    className="input"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="form-label">Description *</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    required
                    placeholder="Enter product description..."
                    rows="4"
                    className="input resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full rounded-lg border border-[#c6a65d] bg-gradient-to-r from-[#f5df9f] to-[#dfbf71] text-[#1f2a44] px-4 py-3 font-semibold hover:from-[#f2d78d] hover:to-[#d6b25f] transition"
                >
                  {editing ? "Update Product" : "Create Product"}
                </button>

                {/* Clear Button if Editing */}
                {editing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="w-full rounded-lg border border-[#2b3a5f] bg-[#1f2a44] text-[#f6df9a] px-4 py-2 font-semibold hover:bg-[#16203a] transition"
                  >
                    Cancel Edit
                  </button>
                )}
              </form>
            </div>
          </div>

          {/* Product List - Right Side */}
          <div className="lg:col-span-3">
            <div className="bg-white/95 border border-[#e3d2a6] rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-[#e3d2a6] bg-gradient-to-r from-[#f8eed3] to-[#f4e7c4] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-[#1f2a44]">Product List</h2>
                  <p className="text-[#4d5a76] text-sm mt-1">
                    Total: {products.length} products across {groupedProducts.length} categories
                  </p>
                </div>
                <button
                  type="button"
                  onClick={scrollToProductForm}
                  className="rounded-lg border border-[#c6a65d] bg-gradient-to-r from-[#f5df9f] to-[#dfbf71] text-[#1f2a44] px-4 py-2 text-sm font-semibold whitespace-nowrap hover:from-[#f2d78d] hover:to-[#d6b25f] transition"
                >
                  + Add New Product
                </button>
              </div>

              {loading ? (
                <div className="p-8">
                  <Loader />
                </div>
              ) : products.length > 0 ? (
                <div className="max-h-[72vh] overflow-y-auto">
                  {groupedProducts.map((group) => (
                    <section key={group.categoryName} className="border-b border-[#e3d2a6] last:border-b-0">
                      <div className="bg-[#f8f2df] px-6 py-4">
                        <div className="flex items-center justify-between gap-4">
                          <h3 className="text-lg font-semibold text-[#1f2a44]">{group.categoryName}</h3>
                          <span className="rounded-full bg-[#d9e1f2] px-3 py-1 text-xs font-medium text-[#2f446f]">
                            {group.items.length} item{group.items.length === 1 ? "" : "s"}
                          </span>
                        </div>
                      </div>

                      <div className="divide-y divide-[#e3d2a6]">
                        {group.items.map((product) => (
                          <div key={product.id} className="p-4 hover:bg-[#fbf3dd] transition">
                            <div className="flex gap-4">
                              <div className="w-20 h-20 flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden">
                                {product.imageUrl ? (
                                  <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="flex items-center justify-center w-full h-full text-slate-400">
                                    📦
                                  </div>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-slate-900 line-clamp-2">{product.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs bg-[#d9e1f2] text-[#2f446f] px-2 py-1 rounded">
                                    {product.category?.name || "Uncategorized"}
                                  </span>
                                  <span className="text-xs bg-[#e7f3e6] text-[#2f6f44] px-2 py-1 rounded">
                                    Stock: {product.stockQuantity || 0}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-600 mt-1 line-clamp-1">
                                  {product.description || "No description"}
                                </p>
                              </div>

                              <div className="flex flex-col items-end gap-2">
                                <p className="text-xl font-bold text-[#2f446f]">
                                  {formatINR(product?.price)}
                                </p>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleEdit(product)}
                                    className="px-3 py-1 text-sm font-medium text-[#1f2a44] hover:bg-[#f8eed3] rounded-lg transition"
                                  >
                                    ✏️ Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(product.id)}
                                    className="px-3 py-1 text-sm font-medium text-[#8c2f39] hover:bg-[#fde8ea] rounded-lg transition"
                                  >
                                    🗑️ Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-2xl text-slate-600">No products yet</p>
                  <p className="text-slate-500 mt-1">Add your first product using the form on the left</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={scrollToProductForm}
        className="lg:hidden fixed bottom-6 right-6 rounded-lg border border-[#c6a65d] bg-gradient-to-r from-[#f5df9f] to-[#dfbf71] text-[#1f2a44] px-4 py-2 font-semibold shadow-xl hover:from-[#f2d78d] hover:to-[#d6b25f] transition"
      >
        + Add Product
      </button>
    </div>
  );
};

const normalizeText = (value) => (value || "").trim().toLowerCase();

const sortCategories = (list) =>
  [...list].sort((left, right) => normalizeText(left.name).localeCompare(normalizeText(right.name)));

const sortProducts = (list) =>
  [...list].sort((left, right) => {
    const categoryComparison = normalizeText(left.category?.name).localeCompare(
      normalizeText(right.category?.name)
    );

    if (categoryComparison !== 0) {
      return categoryComparison;
    }

    return normalizeText(left.name).localeCompare(normalizeText(right.name));
  });

const groupProductsByCategory = (list) => {
  const groups = [];

  sortProducts(list).forEach((product) => {
    const categoryName = product.category?.name || "Uncategorized";
    const lastGroup = groups[groups.length - 1];

    if (!lastGroup || lastGroup.categoryName !== categoryName) {
      groups.push({ categoryName, items: [product] });
      return;
    }

    lastGroup.items.push(product);
  });

  return groups;
};

const compressImageFile = async (file) => {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please upload a valid image file.");
  }

  const sourceDataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(sourceDataUrl);
  const canvas = document.createElement("canvas");
  const { width, height } = getScaledDimensions(image.width, image.height);
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Image processing is not supported in this browser.");
  }

  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);

  let quality = 0.85;
  let compressedDataUrl = canvas.toDataURL("image/jpeg", quality);

  while (compressedDataUrl.length > MAX_IMAGE_DATA_URL_LENGTH && quality > 0.4) {
    quality -= 0.1;
    compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
  }

  if (compressedDataUrl.length > MAX_IMAGE_DATA_URL_LENGTH) {
    throw new Error("Image is still too large after compression. Please choose a smaller image.");
  }

  return compressedDataUrl;
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Unable to read the selected image."));
    reader.readAsDataURL(file);
  });

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to load the selected image."));
    image.src = src;
  });

const getScaledDimensions = (width, height) => {
  const longestSide = Math.max(width, height);

  if (longestSide <= MAX_IMAGE_DIMENSION) {
    return { width, height };
  }

  const scale = MAX_IMAGE_DIMENSION / longestSide;

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
};

export default AdminProducts;

