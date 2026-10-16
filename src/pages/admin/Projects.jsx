import { useEffect, useMemo, useState } from "react";
import Loader from "../../components/Loader";
import {
  createProject,
  deleteProject,
  fetchAdminProject,
  fetchAdminProjects,
  reorderProjects,
  updateProject,
} from "../../api/projectApi";
import { compressImageFile } from "../../utils/imageCompress";

const MAX_IMAGES = 8;

const emptyForm = {
  title: "",
  description: "",
  images: [],
  displayOrder: 1,
  active: true,
};

const unwrapList = (response) => {
  const payload = response?.data?.data || response?.data;
  return Array.isArray(payload) ? payload : payload?.content || [];
};

const sortProjects = (list) =>
  [...list].sort(
    (left, right) =>
      (left.displayOrder ?? 0) - (right.displayOrder ?? 0) || (left.id ?? 0) - (right.id ?? 0)
  );

const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [error, setError] = useState("");

  const nextDisplayOrder = useMemo(
    () => (projects.length ? Math.max(...projects.map((project) => project.displayOrder || 0)) + 1 : 1),
    [projects]
  );

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError("");
      setProjects(sortProjects(unwrapList(await fetchAdminProjects())));
    } catch (err) {
      console.error("Unable to load projects:", err);
      setError(err.response?.data?.message || "Unable to load projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (editingId === null) {
      setForm((current) => ({ ...current, displayOrder: nextDisplayOrder }));
    }
  }, [nextDisplayOrder, editingId]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const resetForm = () => {
    setEditingId(null);
    setImageUrlInput("");
    setForm({ ...emptyForm, displayOrder: nextDisplayOrder });
  };

  const handleEdit = async (project) => {
    try {
      setError("");
      setLoadingEdit(true);
      const response = await fetchAdminProject(project.id);
      const full = response?.data?.data || response?.data;
      setEditingId(full.id);
      setImageUrlInput("");
      setForm({
        title: full.title || "",
        description: full.description || "",
        images: full.images || [],
        displayOrder: full.displayOrder ?? 1,
        active: full.active ?? true,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Unable to load project:", err);
      setError(err.response?.data?.message || "Unable to load project for editing.");
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleDelete = async (project) => {
    if (!window.confirm(`Delete project "${project.title}"? This cannot be undone.`)) {
      return;
    }
    try {
      setError("");
      await deleteProject(project.id);
      if (editingId === project.id) {
        resetForm();
      }
      await loadProjects();
    } catch (err) {
      console.error("Unable to delete project:", err);
      setError(err.response?.data?.message || "Unable to delete project.");
    }
  };

  const handleMove = async (projectId, direction) => {
    const currentIndex = projects.findIndex((project) => project.id === projectId);
    const targetIndex = currentIndex + direction;
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= projects.length) {
      return;
    }

    const reordered = [...projects];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    try {
      setError("");
      await reorderProjects(reordered.map((project) => project.id));
      await loadProjects();
    } catch (err) {
      console.error("Unable to reorder projects:", err);
      setError(err.response?.data?.message || "Unable to reorder projects.");
    }
  };

  /* ---- gallery editing (in-form) ---- */

  const handleFilesChange = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) {
      return;
    }

    const room = MAX_IMAGES - form.images.length;
    if (room <= 0) {
      setError(`A project can have at most ${MAX_IMAGES} images.`);
      return;
    }

    setError("");
    setProcessing(true);
    const accepted = files.slice(0, room);
    const added = [];
    const problems = [];

    for (const file of accepted) {
      try {
        added.push(await compressImageFile(file));
      } catch (err) {
        console.error("Unable to process image:", err);
        problems.push(err.message || `Unable to process "${file.name}".`);
      }
    }

    if (files.length > room) {
      problems.push(`Only ${room} more image${room === 1 ? "" : "s"} allowed; ${files.length - room} skipped.`);
    }

    setForm((current) => ({ ...current, images: [...current.images, ...added].slice(0, MAX_IMAGES) }));
    setProcessing(false);
    if (problems.length) {
      setError(problems.join(" "));
    }
  };

  const handleAddImageUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) {
      return;
    }
    if (!/^https?:\/\//i.test(url)) {
      setError("Image URL must start with http:// or https://");
      return;
    }
    if (form.images.length >= MAX_IMAGES) {
      setError(`A project can have at most ${MAX_IMAGES} images.`);
      return;
    }
    setError("");
    setForm((current) => ({ ...current, images: [...current.images, url] }));
    setImageUrlInput("");
  };

  const moveImage = (index, direction) => {
    setForm((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.images.length) {
        return current;
      }
      const images = [...current.images];
      [images[index], images[target]] = [images[target], images[index]];
      return { ...current, images };
    });
  };

  const makeCover = (index) => {
    setForm((current) => {
      const images = [...current.images];
      const [picked] = images.splice(index, 1);
      return { ...current, images: [picked, ...images] };
    });
  };

  const removeImage = (index) => {
    setForm((current) => ({ ...current, images: current.images.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.images.length) {
      setError("Please add at least one image.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        images: form.images,
        displayOrder: Number(form.displayOrder) || 0,
        active: Boolean(form.active),
      };

      if (editingId !== null) {
        await updateProject(editingId, payload);
      } else {
        await createProject(payload);
      }

      resetForm();
      await loadProjects();
    } catch (err) {
      console.error("Unable to save project:", err);
      setError(err.response?.data?.message || "Unable to save project.");
    } finally {
      setSaving(false);
    }
  };

  const isEditing = editingId !== null;

  return (
    <div className="min-h-screen bg-transparent">
      <div className="bg-gradient-to-r from-[#1c2742] via-[#223154] to-[#2f446f] text-[#f7e4ac] border-b border-amber-200/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold">Manage Our Projects</h1>
          <p className="text-amber-100/85 mt-2">
            Add up to {MAX_IMAGES} photos per project, write its title and description, and set the order shown on the home page
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error ? (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white/95 border border-[#e3d2a6] rounded-lg shadow-md p-8 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
              <h2 className="text-2xl font-bold text-[#1f2a44] mb-6">{isEditing ? "Edit Project" : "Add Project"}</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="form-label">Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    maxLength={255}
                    className="input"
                    placeholder="Lakeview Apartment Makeover"
                  />
                </div>

                <div>
                  <label className="form-label">Description *</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    required
                    rows="6"
                    maxLength={5000}
                    className="input resize-y"
                    placeholder="Tell the story of this project: the space, what we supplied, the finish..."
                  />
                  <p className="mt-1 text-xs text-slate-500">{form.description.length} / 5000</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                  <label className="inline-flex items-end gap-2 pb-3 text-sm text-slate-700">
                    <input type="checkbox" name="active" checked={form.active} onChange={handleChange} />
                    Active (visible)
                  </label>
                </div>

                {/* Images */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="form-label !mb-0">
                      Images * ({form.images.length}/{MAX_IMAGES})
                    </label>
                  </div>

                  <div className="mt-2 border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-[#d6b25f] hover:bg-[#f8eed3] transition">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFilesChange}
                      disabled={form.images.length >= MAX_IMAGES || processing}
                      className="hidden"
                      id="project-images-input"
                    />
                    <label
                      htmlFor="project-images-input"
                      className={`text-[#2f446f] ${
                        form.images.length >= MAX_IMAGES || processing ? "opacity-50" : "cursor-pointer"
                      }`}
                    >
                      {processing
                        ? "Processing images..."
                        : form.images.length >= MAX_IMAGES
                        ? "Maximum images reached"
                        : "Click to upload images (select several at once)"}
                    </label>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <input
                      type="url"
                      value={imageUrlInput}
                      onChange={(event) => setImageUrlInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          handleAddImageUrl();
                        }
                      }}
                      className="input"
                      placeholder="…or paste an image URL"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      disabled={form.images.length >= MAX_IMAGES}
                      className="shrink-0 rounded-lg border border-[#2b3a5f] bg-[#1f2a44] text-[#f6df9a] px-4 font-semibold hover:bg-[#16203a] transition disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>

                  {form.images.length ? (
                    <ul className="mt-4 grid grid-cols-2 gap-3">
                      {form.images.map((src, index) => (
                        <li key={`${index}-${src.length}`} className="rounded-lg border border-slate-200 overflow-hidden bg-white">
                          <div className="relative">
                            <img src={src} alt={`Project image ${index + 1}`} className="h-28 w-full object-cover" />
                            {index === 0 && (
                              <span className="absolute left-1.5 top-1.5 rounded-full bg-[#1c2742] px-2 py-0.5 text-[10px] font-semibold text-[#f7e4ac]">
                                Cover
                              </span>
                            )}
                            <span className="absolute right-1.5 top-1.5 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold text-white">
                              {index + 1}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-1 p-1.5 text-xs">
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => moveImage(index, -1)}
                                disabled={index === 0}
                                aria-label="Move image earlier"
                                className="rounded px-2 py-1 text-[#4d5a76] hover:bg-[#eceff5] disabled:opacity-40"
                              >
                                ←
                              </button>
                              <button
                                type="button"
                                onClick={() => moveImage(index, 1)}
                                disabled={index === form.images.length - 1}
                                aria-label="Move image later"
                                className="rounded px-2 py-1 text-[#4d5a76] hover:bg-[#eceff5] disabled:opacity-40"
                              >
                                →
                              </button>
                              {index !== 0 && (
                                <button
                                  type="button"
                                  onClick={() => makeCover(index)}
                                  className="rounded px-2 py-1 text-[#1f2a44] hover:bg-[#f8eed3]"
                                >
                                  Cover
                                </button>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="rounded px-2 py-1 text-red-600 hover:bg-red-50"
                            >
                              Remove
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm text-slate-500">No images yet. The first image is the cover shown in the slideshow.</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={saving || processing || loadingEdit}
                  className="w-full rounded-lg border border-[#c6a65d] bg-gradient-to-r from-[#f5df9f] to-[#dfbf71] text-[#1f2a44] px-4 py-2.5 font-semibold hover:from-[#f2d78d] hover:to-[#d6b25f] transition disabled:opacity-60"
                >
                  {saving ? "Saving..." : isEditing ? "Update Project" : "Create Project"}
                </button>

                {isEditing ? (
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

          {/* List */}
          <div className="lg:col-span-3">
            <div className="bg-white/95 border border-[#e3d2a6] rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-[#e3d2a6] bg-gradient-to-r from-[#f8eed3] to-[#f4e7c4]">
                <h2 className="text-2xl font-bold text-[#1f2a44]">Projects</h2>
                <p className="text-[#4d5a76] text-sm mt-1">Total: {projects.length}</p>
              </div>

              {loading ? (
                <div className="p-8">
                  <Loader />
                </div>
              ) : projects.length ? (
                <div className="divide-y divide-[#e3d2a6]">
                  {projects.map((project, index) => (
                    <div
                      key={project.id}
                      className={`p-4 transition hover:bg-[#fbf3dd] ${editingId === project.id ? "bg-[#fbf3dd]" : ""}`}
                    >
                      <div className="flex flex-col md:flex-row md:items-start gap-4">
                        <img
                          src={project.coverImage}
                          alt={project.title}
                          className="w-full md:w-44 h-28 object-cover rounded-lg border border-slate-200"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-[#1f2a44]">{project.title}</p>
                            <span className="text-xs rounded-full px-2 py-0.5 bg-[#d9e1f2] text-[#2f446f]">
                              {project.imageCount} photo{project.imageCount === 1 ? "" : "s"}
                            </span>
                            <span className="text-xs rounded-full px-2 py-0.5 bg-[#eceff5] text-[#4d5a76]">
                              Order: {project.displayOrder ?? 0}
                            </span>
                            <span
                              className={`text-xs rounded-full px-2 py-0.5 ${
                                project.active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                              }`}
                            >
                              {project.active ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-slate-600 line-clamp-3">{project.description}</p>
                        </div>

                        <div className="flex flex-wrap md:flex-col gap-2 md:items-end">
                          <button
                            type="button"
                            onClick={() => handleEdit(project)}
                            disabled={loadingEdit}
                            className="px-3 py-1.5 text-sm font-medium text-[#1f2a44] hover:bg-[#f8eed3] rounded-lg transition disabled:opacity-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMove(project.id, -1)}
                            disabled={index === 0}
                            className="px-3 py-1.5 text-sm font-medium text-[#4d5a76] hover:bg-[#eceff5] rounded-lg transition disabled:opacity-50"
                          >
                            Move Up
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMove(project.id, 1)}
                            disabled={index === projects.length - 1}
                            className="px-3 py-1.5 text-sm font-medium text-[#4d5a76] hover:bg-[#eceff5] rounded-lg transition disabled:opacity-50"
                          >
                            Move Down
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(project)}
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
                <div className="p-10 text-center text-slate-600">No projects yet. Add your first project.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProjects;
