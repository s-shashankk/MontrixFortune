import { useEffect } from "react";
import { Link } from "react-router-dom";
import { business } from "../../config/business";

const policyLinks = [
  { to: "/shipping-policy", label: "Shipping Policy" },
  { to: "/refund-policy", label: "Cancellation & Refund Policy" },
  { to: "/privacy-policy", label: "Privacy Policy" },
  { to: "/terms", label: "Terms & Conditions" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact Us" },
];

const LegalLayout = ({ title, intro, showUpdated = true, children }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `${title} | ${business.brandName}`;
  }, [title]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <nav className="text-sm text-stone-500 mb-4" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-stone-800">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-stone-700">{title}</span>
      </nav>

      <article className="rounded-xl border border-amber-100 bg-white shadow-sm p-6 sm:p-10">
        <h1 className="text-4xl font-bold text-stone-900">{title}</h1>
        {showUpdated ? <p className="mt-1 text-sm text-stone-500">Last updated: {business.lastUpdated}</p> : null}
        {intro ? <p className="mt-4 text-stone-700 leading-relaxed">{intro}</p> : null}
        <div className="legal-prose">{children}</div>
      </article>

      <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
        {policyLinks.map((link) => (
          <Link key={link.to} to={link.to} className="text-amber-800 hover:underline">{link.label}</Link>
        ))}
      </div>
    </div>
  );
};

export default LegalLayout;
