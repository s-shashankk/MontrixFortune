import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { formatINR } from "../utils/currency";

const ProductCard = ({ product, onAddToCart }) => {
  const categoryText = product?.category?.name || product?.category || "Furniture";
  const [images, setImages] = useState(null);
  const [index, setIndex] = useState(0);

  const total = images ? images.length : Math.max(product?.imageCount || 0, product?.imageUrl ? 1 : 0);
  const shown = images ? images[index] : product?.imageUrl;

  const step = async (event, direction) => {
    event.preventDefault();
    event.stopPropagation();
    let list = images;
    if (!list) {
      try {
        const response = await api.get(`/api/products/${product.id}`);
        const data = response?.data?.data || response?.data;
        list = data?.images?.length ? data.images : [product.imageUrl];
        setImages(list);
      } catch (err) {
        console.error("Unable to load product images:", err);
        return;
      }
    }
    setIndex((current) => (current + direction + list.length) % list.length);
  };

  return (
    <article className="card p-3! sm:p-5! overflow-hidden flex flex-col h-full group">
      {/* Image Container */}
      <div className="relative mb-3">
      <Link to={`/product/${product?.id}`} className="block overflow-hidden rounded-lg bg-stone-100 aspect-[4/3]">
        {shown ? (
          <img 
            src={shown} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-400 text-sm font-medium">
            No Image
          </div>
        )}
      </Link>
        {total > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={(e) => step(e, -1)}
              className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white/90 text-[#1f2a44] shadow flex items-center justify-center hover:bg-white"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={(e) => step(e, 1)}
              className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white/90 text-[#1f2a44] shadow flex items-center justify-center hover:bg-white"
            >
              ›
            </button>
            <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1.5 pointer-events-none">
              {Array.from({ length: total }).map((_, i) => (
                <span key={i} className={`h-1.5 w-1.5 rounded-full ${i === index ? "bg-white" : "bg-white/50"}`} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {/* Category Badge */}
        <span className="inline-block px-2 py-1 bg-stone-100 text-stone-700 text-xs font-semibold rounded-full mb-2 w-fit">
          {categoryText}
        </span>

        {/* Title */}
        <Link to={`/product/${product?.id}`} className="font-bold text-sm sm:text-base text-stone-900 hover:text-stone-700 line-clamp-2 mb-1 transition">
          {product?.name || "Product Name"}
        </Link>

        {/* Description */}
        <p className="text-stone-600 text-sm line-clamp-1 mb-3 flex-1">
          {product?.description || "Premium quality furniture piece"}
        </p>

        {/* Price */}
        <div className="mb-3 pt-2 sm:pt-3 border-t border-stone-200">
          <span className="text-base sm:text-xl font-bold text-stone-800">
            {formatINR(product?.price)}
          </span>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 mt-auto">
          <button
            onClick={() => onAddToCart(product)}
            className="flex-1 btn btn-primary text-xs px-2!"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 7h11M10 20a1 1 0 100 2 1 1 0 000-2zm8 0a1 1 0 100 2 1 1 0 000-2z" />
            </svg>
            Add
          </button>
          <Link
            to={`/product/${product?.id}`}
            className="flex-1 btn btn-secondary text-xs text-center px-2!"
          >
            View
          </Link>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
