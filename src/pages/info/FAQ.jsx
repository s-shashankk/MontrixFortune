import LegalLayout from "../legal/LegalLayout";
import { business } from "../../config/business";

const p = business.policies;
const faqs = [
  ["How do I track my order?", "Log in and open My Orders. The status updates as your order moves from Confirmed to Packing, Out for Shipment, Shipped and Delivered."],
  ["Which payment methods do you accept?", `We accept UPI, cards and net banking via Razorpay${p.codAvailable ? ", and Cash on Delivery on eligible orders" : ""}.`],
  ["Is online payment secure?", "Yes. Payments are processed by Razorpay. We never see or store your card details, and every payment is verified on our server before the order is confirmed."],
  ["How long does delivery take?", `Orders are processed in ${p.processingDays} and typically delivered in ${p.deliveryDays} after dispatch.`],
  ["Are prices inclusive of tax?", "Yes, the price shown includes applicable taxes. The amount you see at checkout is the amount you pay."],
  ["Can I cancel my order?", "Yes, before it is dispatched. Email us with your order number. See the Cancellation & Refund Policy."],
  ["What if my product arrives damaged?", `Report it within ${p.damageReportHours} hours of delivery with photos. Damaged, defective or wrong items can be returned or replaced within ${p.returnWindowDays} days.`],
  ["When will I get my refund?", `Approved refunds reach your original payment method within ${p.refundTime}. If a payment was debited but the order failed, it is refunded automatically.`],
  ["I was charged but my order shows pending. What should I do?", "Wait a few minutes and refresh My Orders. If it is still not confirmed, contact us with your payment reference and we will resolve or refund it."],
  ["How can I contact you?", `Email ${business.supportEmail} or call ${business.phone} (${business.supportHours}).`],
];

const FAQ = () => (
  <LegalLayout title="Frequently Asked Questions" showUpdated={false} intro="Quick answers to common questions.">
    <div className="mt-6 divide-y divide-amber-100 border-y border-amber-100">
      {faqs.map(([q, a]) => (
        <details key={q} className="group py-4">
          <summary className="cursor-pointer font-semibold text-stone-900 list-none flex justify-between gap-4">
            {q}<span className="text-amber-700 group-open:rotate-45 transition">+</span>
          </summary>
          <p className="mt-2 text-stone-700 leading-relaxed">{a}</p>
        </details>
      ))}
    </div>
  </LegalLayout>
);

export default FAQ;
