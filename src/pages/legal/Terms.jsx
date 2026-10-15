import { Link } from "react-router-dom";
import LegalLayout from "./LegalLayout";
import { business } from "../../config/business";

const Terms = () => (
  <LegalLayout
    title="Terms & Conditions"
    intro={`Welcome to ${business.brandName}. By using this website or placing an order you agree to these terms. Please read them with our Shipping, Cancellation & Refund and Privacy policies.`}
  >
    <h2>1. About us</h2>
    <p>
      This website is operated by {business.legalName}, {business.addressLines.join(", ")}.
      {business.gstin ? ` GSTIN: ${business.gstin}.` : ""} Contact: <a href={`mailto:${business.supportEmail}`}>{business.supportEmail}</a>, {business.phone}.
    </p>

    <h2>2. Eligibility and your account</h2>
    <ul>
      <li>You must be at least 18 years old and able to enter a binding contract under Indian law.</li>
      <li>Give accurate information and keep your password confidential. You are responsible for activity on your account.</li>
      <li>Tell us immediately if you think your account has been misused. We may suspend accounts that are used unlawfully or abusively.</li>
    </ul>

    <h2>3. Products, prices and availability</h2>
    <ul>
      <li>All prices are in Indian Rupees (INR) and include applicable taxes unless stated otherwise.</li>
      <li>Delivery within India is {business.policies.shippingCharge === "Free" ? "free" : `charged at ${business.policies.shippingCharge}`} unless shown otherwise at checkout.</li>
      <li>We try to show products accurately. Colours and finishes can look slightly different on different screens, and wood grain varies naturally. Dimensions are approximate.</li>
      <li>Products are subject to availability. If an item becomes unavailable or a price was listed by mistake, we may cancel the order and refund any amount paid.</li>
    </ul>

    <h2>4. Placing an order</h2>
    <p>
      An order is a request to buy. It is accepted when it appears as confirmed in your account (for online payments, after
      the payment succeeds; for Cash on Delivery, when the order is confirmed). We may decline or cancel an order for reasons such as
      stock issues, pricing errors, suspected fraud or an undeliverable address.
    </p>

    <h2>5. Payment</h2>
    <ul>
      <li>Online payments (UPI, cards, netbanking, wallets) are processed securely by Razorpay. We do not store your card details.</li>
      {business.policies.codAvailable ? <li>Cash on Delivery may be available for eligible orders. Please keep the exact amount ready.</li> : null}
      <li>If money is debited but your order is not confirmed, it will be refunded as described in our <Link to="/refund-policy">Cancellation & Refund Policy</Link>.</li>
    </ul>

    <h2>6. Delivery, cancellation, returns and refunds</h2>
    <p>
      These are explained in our <Link to="/shipping-policy">Shipping Policy</Link> and{" "}
      <Link to="/refund-policy">Cancellation & Refund Policy</Link>, which form part of these terms.
    </p>

    <h2>7. Warranty</h2>
    <p>
      Products carry the warranty stated on their product page or in the product description (for example, mattresses list their
      warranty period). The warranty covers manufacturing defects and does not cover damage from misuse, accidents, improper
      assembly, water, normal wear and tear, or unauthorised repairs.
    </p>

    <h2>8. Acceptable use</h2>
    <p>You agree not to misuse the website, including attempting to break its security, scraping it, placing fraudulent orders, or using it for unlawful purposes.</p>

    <h2>9. Intellectual property</h2>
    <p>
      The website's content, logo, product descriptions, images and design belong to {business.legalName} or its licensors and may not be copied or
      reused without written permission.
    </p>

    <h2>10. Limitation of liability</h2>
    <p>
      To the extent permitted by law, we are not liable for indirect or consequential losses. Our total liability for any order is limited to the amount you paid
      for that order. Nothing in these terms limits any right you have under the Consumer Protection Act, 2019 or other law that cannot be excluded.
    </p>

    <h2>11. Governing law</h2>
    <p>
      These terms are governed by the laws of India. Subject to your statutory consumer rights, courts at {business.city} have jurisdiction over disputes.
    </p>

    <h2>12. Changes</h2>
    <p>We may update these terms. The version published on this page when you place an order applies to that order.</p>

    <h2>13. Contact</h2>
    <p>
      Questions? Email <a href={`mailto:${business.supportEmail}`}>{business.supportEmail}</a> or call {business.phone} ({business.supportHours}).
    </p>
  </LegalLayout>
);

export default Terms;
