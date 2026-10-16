import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProducts, fetchProductsByCategory, searchProducts } from "../../api/productApi";
import { fetchCategories, fetchSubCategories } from "../../api/categoryApi";
import { fetchHeroSlides } from "../../api/heroSlideApi";
import { addToCart } from "../../api/cartApi";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import Loader from "../../components/Loader";
import ProductCard from "../../components/ProductCard";
import OurProjects from "../../components/OurProjects";

const PAGE_SIZE = 30;

const DEFAULT_HERO_SLIDES = [
  {
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1800&q=80",
    label: "Modern Living",
    title: "Bring warmth to your everyday spaces",
    subtitle: "Curated sofas, tables, and decor pieces made for comfortable, beautiful homes.",
    textPosition: "LEFT",
  },
  {
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1800&q=80",
    label: "Dining Essentials",
    title: "Host, gather, and celebrate in style",
    subtitle: "From statement dining sets to minimalist accents, discover pieces built to last.",
    textPosition: "CENTER",
  },
  {
    image:
      "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1800&q=80",
    label: "Bedroom Comfort",
    title: "Design your calmest corner",
    subtitle: "Soft textures, elegant finishes, and premium furniture for restful nights.",
    textPosition: "RIGHT",
  },
];

const getSlideContent = (response) => {
  const payload = response?.data?.data || response?.data;
  return Array.isArray(payload) ? payload : payload?.content || [];
};

const getTextPositionClasses = (textPosition) => {
  if (textPosition === "CENTER") {
    return "mx-auto text-center";
  }

  if (textPosition === "RIGHT") {
    return "ml-auto text-right";
  }

  return "mr-auto text-left";
};

const Home = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const { refreshCart } = useCart();
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [subCategories, setSubCategories] = useState([]);
  const [activeSub, setActiveSub] = useState(null);
  const shopRef = useRef(null);
  const [search, setSearch] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroSlides, setHeroSlides] = useState(DEFAULT_HERO_SLIDES);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getCategoryName = (product) => product?.category?.name || product?.category || "Other";

  const buildCategories = (productList) => {
    const names = Array.from(
      new Set(productList.map(getCategoryName).filter((name) => Boolean(name)))
    );
    return ["All", ...names];
  };

  const slides = heroSlides.length ? heroSlides : DEFAULT_HERO_SLIDES;

  const loadProducts = useCallback(async (page = 0) => {
    try {
      setError("");
      setLoading(true);
      const response = await fetchProducts(page, PAGE_SIZE);
      const data = response?.data;
      const list = Array.isArray(data) ? data : data?.content || [];
      setProducts(list);
      setCategories((existingCategories) => {
        if (existingCategories.length > 1) {
          return existingCategories;
        }

        return buildCategories(list);
      });
      setCurrentPage(data?.number ?? page);
      setTotalPages(Math.max(1, data?.totalPages ?? 1));
      setActiveCategory("All");
    } catch (err) {
      console.error("Failed to load products:", err);
      setError(err.response?.data?.message || "Unable to load products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts(0);
  }, [loadProducts]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetchCategories();
        const data = response?.data?.data || response?.data;
        const list = Array.isArray(data) ? data : data?.content || [];
        const categoryNames = list
          .map((category) => category?.name)
          .filter((name) => Boolean(name));

        if (categoryNames.length) {
          setCategories(["All", ...categoryNames]);
        }
      } catch (err) {
        console.error("Unable to load categories:", err);
      }
    };

    loadCategories();

    const loadSubCategories = async () => {
      try {
        const response = await fetchSubCategories();
        const data = response?.data?.data || response?.data;
        setSubCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Unable to load sub-categories:", err);
      }
    };

    loadSubCategories();
  }, []);

  useEffect(() => {
    const loadSlides = async () => {
      try {
        const response = await fetchHeroSlides();
        const list = getSlideContent(response)
          .filter((slide) => (slide?.active ?? true) && slide?.imageUrl)
          .sort((left, right) => (left.displayOrder ?? 0) - (right.displayOrder ?? 0));

        if (list.length > 0) {
          setHeroSlides(
            list.map((slide) => ({
              image: slide.imageUrl,
              label: slide.label,
              title: slide.title,
              subtitle: slide.subtitle,
              textPosition: (slide.textPosition || "LEFT").toUpperCase(),
            }))
          );
        }
      } catch (err) {
        console.error("Failed to load hero slides:", err);
      }
    };

    loadSlides();
  }, []);

  useEffect(() => {
    if (!slides.length) {
      return undefined;
    }

    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4500);

    return () => clearInterval(slideTimer);
  }, [slides.length]);

  useEffect(() => {
    if (currentSlide >= slides.length) {
      setCurrentSlide(0);
    }
  }, [currentSlide, slides.length]);

  const handleSearch = async (event) => {
    event.preventDefault();
    try {
      setError("");
      setLoading(true);
      if (!search.trim()) {
        await loadProducts();
        return;
      }
      const response = await searchProducts(search.trim());
      const data = response?.data;
      const list = Array.isArray(data) ? data : data?.content || [];
      setProducts(list);
      setActiveCategory("All");
      setCurrentPage(0);
      setTotalPages(1);
    } catch (err) {
      console.error("Search failed:", err);
      setError(err.response?.data?.message || "Search failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const activeSubCategories = subCategories.filter((sub) => sub.categoryName === activeCategory);
  const visibleProducts =
    activeCategory !== "All" && activeSub
      ? products.filter((product) => product?.subCategory?.id === activeSub)
      : products;

  const handleCategorySelect = async (category) => {
    if (category === activeCategory) {
      return;
    }

    setActiveCategory(category);
    setActiveSub(null);
    setError("");
    setTimeout(() => shopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);

    if (category === "All") {
      await loadProducts(0);
      return;
    }

    try {
      setLoading(true);
      const response = await fetchProductsByCategory(category);
      const data = response?.data;
      const list = Array.isArray(data) ? data : data?.content || [];
      setProducts(list);
      setCurrentPage(0);
      setTotalPages(1);
    } catch (err) {
      console.error("Failed category filter:", err);
      setError(err.response?.data?.message || "Unable to load category products.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    if (!auth) {
      navigate("/login");
      return;
    }

    try {
      await addToCart(product.id, 1);
      await refreshCart();
      showToast("Product added to cart.", "success");
    } catch (err) {
      console.error("Failed to add to cart:", err);
      showToast(err.response?.data?.message || "Unable to add item to cart.", "error");
    }
  };

  const showPagination = activeCategory === "All" && !search.trim() && totalPages > 1;

  const handlePageChange = async (page) => {
    if (page < 0 || page >= totalPages || page === currentPage || loading) {
      return;
    }

    await loadProducts(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-transparent">
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden rounded-b-[2.5rem] text-white min-h-[520px] sm:min-h-[560px] lg:min-h-[620px]">
        <div className="absolute inset-0">
          {slides.map((slide, index) => (
            <div
              key={`${slide.image}-${index}`}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                currentSlide === index ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={slide.image}
                alt={slide.label}
                className={`h-full w-full object-cover brightness-110 saturate-105 transition-transform duration-[4500ms] ${
                  currentSlide === index ? "scale-105" : "scale-100"
                }`}
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-[#131b2f]/55 via-[#1f2a44]/22 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 h-full min-h-[520px] sm:min-h-[560px] lg:min-h-[620px] flex flex-col justify-center">
          <div className={`max-w-3xl min-h-[220px] [text-shadow:0_2px_14px_rgba(10,16,32,0.55)] ${getTextPositionClasses(slides[currentSlide].textPosition)}`}>
            <span className="inline-flex items-center rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold tracking-wide backdrop-blur-sm">
              {slides[currentSlide].label}
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-black leading-tight">
              {slides[currentSlide].title}
            </h1>
            <p className="mt-5 text-lg sm:text-xl text-slate-100">
              {slides[currentSlide].subtitle}
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className={`mt-8 flex flex-col sm:flex-row gap-3 max-w-xl ${getTextPositionClasses(slides[currentSlide].textPosition)}`}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sofas, tables, lamps..."
              className="flex-1 px-4 py-3 rounded-lg text-slate-900 bg-white/95 focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </form>

          <div className="mt-8 flex items-center gap-2">
            {slides.map((slide, index) => (
              <button
                key={`${slide.label}-${index}`}
                type="button"
                aria-label={`Show slide ${index + 1}`}
                onClick={() => setCurrentSlide(index)}
                className={`h-2.5 rounded-full transition-all ${
                  currentSlide === index ? "w-8 bg-stone-200" : "w-2.5 bg-white/60 hover:bg-white"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Our Projects showcase (hidden automatically when no active projects) */}
      <OurProjects />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Categories Filter */}
        {categories.length > 1 && (
          <div className="mb-12">
            <div className="mb-4">
              <h2 className="text-3xl font-bold text-[#1f2a44]">Shop by Category</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategorySelect(category)}
                  className={`group rounded-2xl border px-4 py-4 text-left transition shadow-sm relative overflow-hidden ${
                    category === activeCategory
                      ? "border-[#223154] bg-gradient-to-br from-[#1c2742] to-[#0f1627] text-[#f7e4ac]"
                      : "border-[#e6d8b4] bg-white/90 hover:border-[#c7ab63] hover:shadow-lg hover:-translate-y-0.5"
                  }`}
                >
                  {category !== activeCategory && (
                    <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-[#e7d39a] via-[#d6b468] to-[#b2863f] opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                  <p className={`font-semibold ${category === activeCategory ? "text-[#f7e4ac]" : "text-[#1f2a44]"}`}>
                    {category}
                  </p>
                </button>
              ))}
            </div>

          </div>
        )}

        <section className="mb-12 relative overflow-hidden rounded-3xl border border-[#d6c08d] bg-gradient-to-r from-[#f7edd1] via-[#efe2bf] to-[#f3ead2] p-6 sm:p-8">
          <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-[#d8b76a]/40 blur-2xl" />
          <div className="absolute -bottom-20 -left-16 h-44 w-44 rounded-full bg-[#8f6a2f]/20 blur-2xl" />
          <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            <div className="lg:col-span-2">
              <p className="inline-flex rounded-full bg-[#1c2742] text-[#f8e7b6] px-3 py-1 text-xs font-semibold tracking-wide">
                Mid-Season Specials
              </p>
              <h3 className="mt-3 text-3xl sm:text-4xl font-black text-[#1f2a44] leading-tight">
                Fresh arrivals that make every room stand out
              </h3>
              <p className="mt-3 text-[#3f4b64] max-w-2xl">
                Explore premium sofa sets, elegant dining collections, and space-smart storage crafted
                for everyday comfort and long-lasting style.
              </p>
            </div>
            <div className="flex lg:justify-end">
              <button
                type="button"
                onClick={() => handleCategorySelect("All")}
                className="btn btn-primary px-6 py-3"
              >
                Shop Collection
              </button>
            </div>
          </div>
        </section>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div ref={shopRef} className="scroll-mt-24">
        {activeCategory !== "All" && activeSubCategories.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            {[{ id: null, name: "All" }, ...activeSubCategories].map((sub) => (
              <button
                key={sub.id ?? "all"}
                onClick={() => setActiveSub(sub.id)}
                className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                  activeSub === sub.id
                    ? "border-[#223154] bg-[#1c2742] text-[#f7e4ac]"
                    : "border-[#d9c791] bg-white/90 text-[#1f2a44] hover:bg-[#f8eed3]"
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <Loader />
        ) : visibleProducts.length ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {visibleProducts.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
              ))}
            </div>

            {showPagination && (
              <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0 || loading}
                  className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handlePageChange(index)}
                    className={`h-10 min-w-10 rounded-lg px-3 text-sm font-semibold transition ${
                      currentPage === index
                        ? "bg-[#1c2742] text-[#f8e7b6]"
                        : "bg-white border border-[#dcc89a] text-[#344260] hover:border-[#c7ab63]"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1 || loading}
                  className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-2xl text-stone-600">No products found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

