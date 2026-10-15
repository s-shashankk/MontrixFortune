import { Link } from "react-router-dom";
import { formatINR } from "../utils/currency";

const ProductCard = ({ product, onAddToCart }) => {
  const categoryText = product?.category?.name || product?.category || "Furniture";

  return (
    <article className="card overflow-hidden flex flex-col h-full group">
      {/* Image Container */}
      <Link to={`/product/${product?.id}`} className="block mb-3 overflow-hidden rounded-lg bg-stone-100 aspect-[4/3]">
        {product?.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-400 text-sm font-medium">
            No Image
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {/* Category Badge */}
        <span className="inline-block px-2 py-1 bg-stone-100 text-stone-700 text-xs font-semibold rounded-full mb-2 w-fit">
          {categoryText}
        </span>

        {/* Title */}
        <Link to={`/product/${product?.id}`} className="font-bold text-base text-stone-900 hover:text-stone-700 line-clamp-2 mb-1 transition">
          {product?.name || "Product Name"}
        </Link>

        {/* Description */}
        <p className="text-stone-600 text-sm line-clamp-1 mb-3 flex-1">
          {product?.description || "Premium quality furniture piece"}
        </p>

        {/* Price */}
        <div className="mb-3 pt-3 border-t border-stone-200">
          <span className="text-xl font-bold text-stone-800">
            {formatINR(product?.price)}
          </span>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 mt-auto">
          <button
            onClick={() => onAddToCart(product)}
            className="flex-1 btn btn-primary text-xs"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 7h11M10 20a1 1 0 100 2 1 1 0 000-2zm8 0a1 1 0 100 2 1 1 0 000-2z" />
            </svg>
            Add
          </button>
          <Link
            to={`/product/${product?.id}`}
            className="flex-1 btn btn-secondary text-xs text-center"
          >
            View
          </Link>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
