import LegalLayout from "./LegalLayout";
import { business } from "../../config/business";

const RefundPolicy = () => {
  const p = business.policies;
  return (
    <LegalLayout
      title="Cancellation & Refund Policy"
      intro={`We want you to be happy with your purchase. This policy explains how cancellations, returns and refunds work at ${business.brandName}.`}
    >
      <h2>1. Cancelling an order</h2>
      <ul>
        <li>You can cancel an order before it is dispatched by contacting us at <a href={`mailto:${business.supportEmail}`}>{business.supportEmail}</a> with your order number.</li>
        <li>Once an order is shipped it cannot be cancelled, but you may still request a return as per section 2.</li>
        <li>We may cancel an order in case of stock unavailability, pricing errors or payment issues, and you will be refunded in full.</li>
      </ul>

      <h2>2. Returns and replacements</h2>
      <p>You may request a return or replacement within <strong>{p.returnWindowDays} days</strong> of delivery if the item is:</p>
      <ul>
        <li>damaged or defective on arrival,</li>
        <li>different from what you ordered, or</li>
        <li>missing parts or accessories.</li>
      </ul>
      <p>Damage during transit must be reported within {p.damageReportHours} hours of delivery along with clear photos of the product and packaging.</p>

      <h2>3. Items not eligible for return</h2>
      <ul>
        <li>Mattresses, toppers, pillows and decor items that have been used or unwrapped (for hygiene reasons), unless damaged, defective or incorrect.</li>
        <li>Products damaged due to misuse, improper assembly or normal wear and tear.</li>
        <li>Products altered or customised on your request.</li>
      </ul>

      <h2>4. How to request a return</h2>
      <ol>
        <li>Email <a href={`mailto:${business.supportEmail}`}>{business.supportEmail}</a> with your order number, a short description and photos.</li>
        <li>Our team will review and respond with the next steps, usually within 2 business days.</li>
        <li>Keep the product in its original packaging until it is picked up.</li>
      </ol>

      <h2>5. Refunds</h2>
      <ul>
        <li>Approved refunds are issued to the original payment method within {p.refundTime} of approval.</li>
        <li>For Cash on Delivery orders, refunds are made by bank transfer or UPI to the account details you share with us.</li>
        <li>If money was debited but your order was not confirmed, the amount is refunded automatically to the source account, usually within {p.refundTime}.</li>
        <li>Your bank may take additional time to reflect the refund.</li>
      </ul>

      <h2>6. Contact</h2>
      <p>Questions? Email <a href={`mailto:${business.supportEmail}`}>{business.supportEmail}</a> or call {business.phone} ({business.supportHours}).</p>
    </LegalLayout>
  );
};

export default RefundPolicy;
