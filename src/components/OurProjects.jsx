import { useCallback, useEffect, useRef, useState } from "react";
import { fetchProject, fetchProjects } from "../api/projectApi";

const GAP = 16; // px between cards
const SECONDS_PER_CARD = 5; // auto-drift speed: one card every N seconds
const RESUME_DELAY_MS = 2500; // pause auto-drift this long after the user touches/scrolls

const unwrap = (response) => response?.data?.data ?? response?.data;

const getPerView = (width) => {
  if (width >= 1024) return 4;
  if (width >= 640) return 2;
  return 1;
};

/* ------------------------------------------------------------------ modal */

const ProjectModal = ({ project, onClose }) => {
  const [detail, setDetail] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const closeRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    fetchProject(project.id)
      .then((response) => {
        if (!cancelled) setDetail(unwrap(response));
      })
      .catch((err) => {
        console.error("Unable to load project:", err);
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [project.id]);

  // Until the full gallery arrives, show the cover we already have.
  const images = detail?.images?.length ? detail.images : project.coverImage ? [project.coverImage] : [];
  const title = detail?.title ?? project.title;
  const description = detail?.description ?? project.description;
  const safeIndex = Math.min(activeIndex, Math.max(images.length - 1, 0));

  const go = useCallback(
    (delta) => {
      if (images.length < 2) return;
      setActiveIndex((current) => (current + delta + images.length) % images.length);
    },
    [images.length]
  );

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      else if (event.key === "ArrowLeft") go(-1);
      else if (event.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [go, onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0b1220]/80 p-3 sm:p-6 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="relative w-full max-w-6xl max-h-[92vh] overflow-y-auto lg:overflow-hidden rounded-3xl bg-white shadow-2xl border border-[#e3d2a6]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close project"
          className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-[#1c2742]/90 text-[#f7e4ac] text-xl leading-none hover:bg-[#1c2742] focus:outline-none focus:ring-2 focus:ring-amber-300"
        >
          ×
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-5 lg:h-[min(78vh,640px)]">
          {/* Left: big image + thumbnails */}
          <div className="lg:col-span-3 bg-[#0f1627] flex flex-col min-h-0">
            <div className="relative flex-1 min-h-[260px] sm:min-h-[360px] lg:min-h-0 flex items-center justify-center">
              {images.length ? (
                <img
                  key={safeIndex}
                  src={images[safeIndex]}
                  alt={`${title} – photo ${safeIndex + 1}`}
                  className="absolute inset-0 h-full w-full object-contain"
                />
              ) : (
                <div className="text-slate-400 text-sm">No images</div>
              )}

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    aria-label="Previous image"
                    className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white text-2xl hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-amber-300"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => go(1)}
                    aria-label="Next image"
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white text-2xl hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-amber-300"
                  >
                    ›
                  </button>
                  <span className="absolute bottom-3 left-3 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white">
                    {safeIndex + 1} / {images.length}
                  </span>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto p-3 bg-[#0b1220]">
                {images.map((src, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Show image ${index + 1}`}
                    aria-current={index === safeIndex}
                    className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                      index === safeIndex ? "border-[#e7c971]" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: header + description */}
          <div className="lg:col-span-2 p-6 sm:p-8 lg:overflow-y-auto bg-gradient-to-b from-[#fffdf8] to-[#f8eed3]/60">
            <p className="inline-flex rounded-full bg-[#1c2742] text-[#f8e7b6] px-3 py-1 text-xs font-semibold tracking-wide">
              Our Projects
            </p>
            <h3 className="mt-4 pr-10 lg:pr-0 text-2xl sm:text-3xl font-black leading-tight text-[#1f2a44]">{title}</h3>
            <div className="mt-4 h-1 w-14 rounded-full bg-gradient-to-r from-[#e7d39a] to-[#b2863f]" />
            <p className="mt-5 whitespace-pre-line text-[#3f4b64] leading-relaxed">{description}</p>
            {failed && !detail && (
              <p className="mt-4 text-sm text-red-600">Could not load all photos for this project.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------- section */

const COPIES = 3; // A B C: start in B so the user can swipe either way; wrap silently

const OurProjects = () => {
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [width, setWidth] = useState(0);
  const viewportRef = useRef(null);
  const posRef = useRef(0); // float scroll position we drive
  const lastWrittenRef = useRef(0);
  const lastInteractRef = useRef(0);
  const hoverRef = useRef(false);
  const modalOpenRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    fetchProjects()
      .then((response) => {
        const payload = unwrap(response);
        const list = (Array.isArray(payload) ? payload : payload?.content || []).filter(
          (project) => project?.coverImage
        );
        if (!cancelled) setProjects(list);
      })
      .catch((err) => console.error("Failed to load projects:", err));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    modalOpenRef.current = Boolean(selected);
  }, [selected]);

  const count = projects.length;
  const hasProjects = count > 0;

  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return undefined;
    const update = () => setWidth(node.clientWidth);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasProjects]);

  const perView = getPerView(width);
  // On phones one card fills ~80% of the row so the next card peeks in, hinting that it can be swiped.
  const cardWidth = width ? (perView === 1 ? width * 0.8 : (width - GAP * (perView - 1)) / perView) : 0;
  const step = cardWidth + GAP;
  const animate = width > 0 && count > perView;
  const shift = count * step; // width of one full copy of the list

  // Position in the middle copy whenever the geometry changes.
  useEffect(() => {
    const node = viewportRef.current;
    if (!node || !animate) return;
    node.scrollLeft = shift;
    posRef.current = shift;
    lastWrittenRef.current = node.scrollLeft;
  }, [animate, shift]);

  // Endless auto-drift + silent wrap-around; swiping/scrolling by the user always wins.
  useEffect(() => {
    const node = viewportRef.current;
    if (!node || !animate) return undefined;

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const speed = step / SECONDS_PER_CARD; // px per second
    let frame = 0;
    let previous = performance.now();

    const write = (value) => {
      posRef.current = value;
      node.scrollLeft = value;
      lastWrittenRef.current = node.scrollLeft;
    };

    const wrap = () => {
      const current = node.scrollLeft;
      if (current >= shift * 2) {
        write(current - shift);
        return true;
      }
      if (current < 1) {
        write(current + shift);
        return true;
      }
      return false;
    };

    const onUserInput = () => {
      lastInteractRef.current = performance.now();
    };

    const onScroll = () => {
      // Scroll events caused by our own writes land within a pixel of what we wrote.
      if (Math.abs(node.scrollLeft - lastWrittenRef.current) > 1.5) {
        lastInteractRef.current = performance.now();
        posRef.current = node.scrollLeft;
        lastWrittenRef.current = node.scrollLeft;
      }
      wrap();
    };

    const onEnter = (event) => {
      if (event.pointerType === "mouse") hoverRef.current = true;
    };
    const onLeave = (event) => {
      if (event.pointerType === "mouse") hoverRef.current = false;
    };

    const tick = (now) => {
      const dt = Math.min(now - previous, 100) / 1000;
      previous = now;

      const idle = now - lastInteractRef.current > RESUME_DELAY_MS;
      if (idle && !hoverRef.current && !modalOpenRef.current && !reduceMotion) {
        write(posRef.current + speed * dt);
        wrap();
      } else {
        posRef.current = node.scrollLeft;
      }
      frame = requestAnimationFrame(tick);
    };

    node.addEventListener("scroll", onScroll, { passive: true });
    node.addEventListener("touchstart", onUserInput, { passive: true });
    node.addEventListener("pointerdown", onUserInput, { passive: true });
    node.addEventListener("wheel", onUserInput, { passive: true });
    node.addEventListener("pointerenter", onEnter);
    node.addEventListener("pointerleave", onLeave);
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      node.removeEventListener("scroll", onScroll);
      node.removeEventListener("touchstart", onUserInput);
      node.removeEventListener("pointerdown", onUserInput);
      node.removeEventListener("wheel", onUserInput);
      node.removeEventListener("pointerenter", onEnter);
      node.removeEventListener("pointerleave", onLeave);
    };
  }, [animate, step, shift]);

  const scrollByCard = (direction) => {
    const node = viewportRef.current;
    if (!node) return;
    lastInteractRef.current = performance.now();
    node.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  const closeModal = useCallback(() => setSelected(null), []);

  if (!hasProjects) return null;

  const items = animate ? Array.from({ length: COPIES }, () => projects).flat() : projects;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16" aria-labelledby="our-projects-heading">
      <div className="mb-6 sm:mb-8 text-center">
        <p className="inline-flex rounded-full bg-[#1c2742] text-[#f8e7b6] px-3 py-1 text-xs font-semibold tracking-wide">
          Showcase
        </p>
        <h2 id="our-projects-heading" className="mt-3 text-3xl sm:text-4xl font-black text-[#1f2a44]">
          Our Projects
        </h2>
        <p className="mt-2 text-sm sm:text-base text-[#4d5a76]">
          Spaces we have designed and furnished. Swipe, then tap a project to see it in full.
        </p>
      </div>

      <div className="relative">
        {animate && (
          <>
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              aria-label="Previous projects"
              className="hidden md:flex absolute -left-3 lg:-left-5 top-1/3 z-10 h-10 w-10 items-center justify-center rounded-full border border-[#d9c791] bg-white/95 text-2xl text-[#1f2a44] shadow-md hover:bg-[#f8eed3] focus:outline-none focus:ring-2 focus:ring-[#d6b25f]"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              aria-label="Next projects"
              className="hidden md:flex absolute -right-3 lg:-right-5 top-1/3 z-10 h-10 w-10 items-center justify-center rounded-full border border-[#d9c791] bg-white/95 text-2xl text-[#1f2a44] shadow-md hover:bg-[#f8eed3] focus:outline-none focus:ring-2 focus:ring-[#d6b25f]"
            >
              ›
            </button>
          </>
        )}

        <div
          ref={viewportRef}
          className={`projects-viewport py-2 ${animate ? "overflow-x-auto" : "overflow-hidden"}`}
          style={{ overscrollBehaviorX: "contain" }}
        >
          <div
            className={`flex ${animate ? "" : "justify-center"}`}
            style={{ gap: GAP, width: animate ? "max-content" : undefined }}
          >
            {items.map((project, index) => {
              const isClone = animate && Math.floor(index / count) !== 1; // the middle copy is the real, focusable one
              return (
                <button
                  key={`${project.id}-${index}`}
                  type="button"
                  onClick={() => setSelected(project)}
                  tabIndex={isClone ? -1 : 0}
                  aria-hidden={isClone || undefined}
                  className="group shrink-0 overflow-hidden rounded-2xl border border-[#e6d8b4] bg-white text-left shadow-sm transition hover:-translate-y-1 hover:border-[#c7ab63] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#d6b25f]"
                  style={{ width: cardWidth || undefined, flexBasis: cardWidth || undefined }}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    <img
                      src={project.coverImage}
                      alt={project.title}
                      loading="lazy"
                      draggable="false"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {project.imageCount > 1 && (
                      <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2.5 py-0.5 text-xs font-semibold text-white">
                        {project.imageCount} photos
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-[#1f2a44] line-clamp-1">{project.title}</h3>
                    <p className="mt-1 text-sm text-[#4d5a76] line-clamp-2">{project.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {selected && <ProjectModal project={selected} onClose={closeModal} />}
    </section>
  );
};

export default OurProjects;
