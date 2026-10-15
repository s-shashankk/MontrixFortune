import { useEffect, useMemo, useState } from "react";
import Loader from "../../components/Loader";
import {
  createHeroSlide,
  deleteHeroSlide,
  fetchAdminHeroSlides,
  reorderHeroSlides,
  updateHeroSlide,
} from "../../api/heroSlideApi";

const MAX_IMAGE_DIMENSION = 1200;
const MAX_IMAGE_DATA_URL_LENGTH = 350000;

const emptyForm = {
  label: "",
  title: "",
  subtitle: "",
  imageUrl: "",
  textPosition: "LEFT",
  displayOrder: 1,
  active: true,
};

const sortSlides = (list) =>
  [...list].sort((left, right) => {
    const orderDelta = (left.displayOrder ?? 0) - (right.displayOrder ?? 0);
    if (orderDelta !== 0) {
      return orderDelta;
    }

    return (left.id ?? 0) - (right.id ?? 0);
  });

const AdminHeroSlides = () => {
  const [slides, setSlides] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const nextDisplayOrder = useMemo(
    () => (slides.length ? Math.max(...slides.map((slide) => slide.displayOrder || 0)) + 1 : 1),
    [slides]
  );

  const loadSlides = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetchAdminHeroSlides();
      const payload = response?.data?.data || response?.data;
      const list = Array.isArray(payload) ? payload : payload?.content || [];
      setSlides(sortSlides(list));
    } catch (err) {
      console.error("Unable to load hero slides:", err);
      setError(err.response?.data?.message || "Unable to load hero slides.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSlides();
  }, []);

  useEffect(() => {
    if (!editing) {
      setForm((current) => ({
        ...current,
        displayOrder: nextDisplayOrder,
      }));
    }
  }, [nextDisplayOrder, editing]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setEditing(null);
    setForm({ ...emptyForm, displayOrder: nextDisplayOrder });
  };

  const handleEdit = (slide) => {
    setEditing(slide);
    setForm({
      label: slide.label || "",
      title: slide.title || "",
      subtitle: slide.subtitle || "",
      imageUrl: slide.imageUrl || "",
      textPosition: (slide.textPosition || "LEFT").toUpperCase(),
      displayOrder: slide.displayOrder || 1,
      active: slide.active ?? true,
    });
  };

  const handleDelete = async (slideId) => {
    try {
      setError("");
      await deleteHeroSlide(slideId);
      if (editing?.id === slideId) {
        resetForm();
      }
      await loadSlides();
    } catch (err) {
      console.error("Unable to delete hero slide:", err);
      setError(err.response?.data?.message || "Unable to delete hero slide.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      const payload = {
        label: form.label.trim(),
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        imageUrl: form.imageUrl.trim(),
        textPosition: form.textPosition,
        displayOrder: Number(form.displayOrder) || 0,
        active: Boolean(form.active),
      };

      if (editing) {
        await updateHeroSlide(editing.id, payload);
      } else {
        await createHeroSlide(payload);
      }

      resetForm();
      await loadSlides();
    } catch (err) {
      console.error("Unable to save hero slide:", err);
      setError(err.response?.data?.message || "Unable to save hero slide.");
    } finally {
      setSaving(false);
    }
  };

  const handleMove = async (slideId, direction) => {
    const currentIndex = slides.findIndex((slide) => slide.id === slideId);
    const targetIndex = currentIndex + direction;

    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= slides.length) {
      return;
    }

    const reordered = [...slides];
    const [selectedSlide] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, selectedSlide);

    const reorderedIds = reordered.map((slide) => slide.id);

    try {
      setError("");
      await reorderHeroSlides(reorderedIds);
      await loadSlides();
    } catch (err) {
      console.error("Unable to reorder slides:", err);
      setError(err.response?.data?.message || "Unable to reorder slides.");
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setError("");
    compressImageFile(file)
      .then((imageUrl) => {
        setForm((previous) => ({ ...previous, imageUrl }));
      })
      .catch((uploadError) => {
        console.error("Unable to process image:", uploadError);
        setError(uploadError.message || "Unable to process image.");
      });
  };

  return (
    <div className="min-h-screen bg-transparent">
      <div className="bg-gradient-to-r from-[#1c2742] via-[#223154] to-[#2f446f] text-[#f7e4ac] border-b border-amber-200/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold">Manage Hero Banners</h1>
          <p className="text-amber-100/85 mt-2">Edit homepage images, words, text position, and display sequence</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error ? (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white/95 border border-[#e3d2a6] rounded-lg shadow-md p-8 sticky top-20">
              <h2 className="text-2xl font-bold text-[#1f2a44] mb-6">{editing ? "Edit Slide" : "Add Slide"}</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="form-label">Label *</label>
                  <input
                    type="text"
                    name="label"
                    value={form.label}
                    onChange={handleChange}
                    required
                    className="input"
                    placeholder="Modern Living"
                  />
                </div>

                <div>
                  <label className="form-label">Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    className="input"
                    placeholder="Bring warmth to your everyday spaces"
                  />
                </div>

                <div>
                  <label className="form-label">Subtitle *</label>
                  <textarea
                    name="subtitle"
                    value={form.subtitle}
                    onChange={handleChange}
                    required
                    rows="3"
                    className="input resize-none"
                    placeholder="Curated sofas, tables, and decor pieces made for comfortable homes."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Text Position</label>
                    <select
                      name="textPosition"
                      value={form.textPosition}
                      onChange={handleChange}
                      className="input"
                    >
                      <option value="LEFT">Left</option>
                      <option value="CENTER">Center</option>
                      <option value="RIGHT">Right</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Display Order</label>
                    <input
                      type="number"
                      name="displayOrder"
                      min="0"
                      value={form.displayOrder}
                      onChange={handleChange}
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Upload Image</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center cursor-pointer hover:border-[#d6b25f] hover:bg-[#f8eed3] transition">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="hero-slide-file-input"
                    />
                    <label htmlFor="hero-slide-file-input" className="cursor-pointer text-[#2f446f]">
                      Click to upload banner image
                    </label>
                  </div>
                </div>

                <div>
                  <label className="form-label">Image URL or Data URL *</label>
                  <textarea
                    name="imageUrl"
                    value={form.imageUrl}
                    onChange={handleChange}
                    required
                    rows="3"
                    className="input resize-y"
                    placeholder="https://example.com/banner.jpg"
                  />
                </div>

                {form.imageUrl ? (
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">Preview</p>
                    <img
                      src={form.imageUrl}
                      alt="Hero preview"
                      className="w-full h-44 object-cover rounded-lg border border-slate-200"
                    />
                  </div>
                ) : null}

                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    name="active"
                    checked={form.active}
                    onChange={handleChange}
                  />
                  Active slide
                </label>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-lg border border-[#c6a65d] bg-gradient-to-r from-[#f5df9f] to-[#dfbf71] text-[#1f2a44] px-4 py-2.5 font-semibold hover:from-[#f2d78d] hover:to-[#d6b25f] transition disabled:opacity-60"
                >
                  {saving ? "Saving..." : editing ? "Update Slide" : "Create Slide"}
                </button>

                {editing ? (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="w-full rounded-lg border border-[#2b3a5f] bg-[#1f2a44] text-[#f6df9a] px-4 py-2 font-semibold hover:bg-[#16203a] transition"
                  >
                    Cancel Edit
                  </button>
                ) : null}
              </form>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white/95 border border-[#e3d2a6] rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-[#e3d2a6] bg-gradient-to-r from-[#f8eed3] to-[#f4e7c4]">
                <h2 className="text-2xl font-bold text-[#1f2a44]">Slides</h2>
                <p className="text-[#4d5a76] text-sm mt-1">Total: {slides.length}</p>
              </div>

              {loading ? (
                <div className="p-8">
                  <Loader />
                </div>
              ) : slides.length ? (
                <div className="divide-y divide-[#e3d2a6]">
                  {sortSlides(slides).map((slide, index) => (
                    <div key={slide.id} className="p-4 hover:bg-[#fbf3dd] transition">
                      <div className="flex flex-col md:flex-row md:items-start gap-4">
                        <img
                          src={slide.imageUrl}
                          alt={slide.label}
                          className="w-full md:w-44 h-28 object-cover rounded-lg border border-slate-200"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-[#1f2a44]">{slide.label}</p>
                            <span className="text-xs rounded-full px-2 py-0.5 bg-[#d9e1f2] text-[#2f446f]">
                              {slide.textPosition || "LEFT"}
                            </span>
                            <span className="text-xs rounded-full px-2 py-0.5 bg-[#eceff5] text-[#4d5a76]">
                              Order: {slide.displayOrder ?? 0}
                            </span>
                            <span
                              className={`text-xs rounded-full px-2 py-0.5 ${
                                slide.active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                              }`}
                            >
                              {slide.active ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <p className="mt-1 font-semibold text-slate-800 line-clamp-2">{slide.title}</p>
                          <p className="mt-1 text-sm text-slate-600 line-clamp-2">{slide.subtitle}</p>
                        </div>

                        <div className="flex md:flex-col gap-2 md:items-end">
                          <button
                            type="button"
                            onClick={() => handleEdit(slide)}
                            className="px-3 py-1.5 text-sm font-medium text-[#1f2a44] hover:bg-[#f8eed3] rounded-lg transition"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMove(slide.id, -1)}
                            disabled={index === 0}
                            className="px-3 py-1.5 text-sm font-medium text-[#4d5a76] hover:bg-[#eceff5] rounded-lg transition disabled:opacity-50"
                          >
                            Move Up
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMove(slide.id, 1)}
                            disabled={index === slides.length - 1}
                            className="px-3 py-1.5 text-sm font-medium text-[#4d5a76] hover:bg-[#eceff5] rounded-lg transition disabled:opacity-50"
                          >
                            Move Down
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(slide.id)}
                            className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center text-slate-600">No slides found. Add your first banner slide.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
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

export default AdminHeroSlides;
