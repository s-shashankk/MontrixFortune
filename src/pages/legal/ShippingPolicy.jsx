import LegalLayout from "./LegalLayout";
import { business } from "../../config/business";

const ShippingPolicy = () => {
  const p = business.policies;
  return (
    <LegalLayout
      title="Shipping Policy"
      intro={`This policy explains how ${business.brandName} processes, ships and delivers your orders.`}
    >
      <h2>1. Where we deliver</h2>
      <p>We deliver to most serviceable PIN codes across India. If your PIN code is not serviceable, we will let you know before or soon after you place the order.</p>

      <h2>2. Order processing</h2>
      <p>Orders are processed within {p.processingDays} of payment confirmation (or order placement for Cash on Delivery). Made-to-order items may take longer, which will be mentioned on the product page.</p>

      <h2>3. Delivery time</h2>
      <p>Estimated delivery is {p.deliveryDays} from dispatch, depending on your location and the size of the item. Delays can occur due to weather, strikes, festivals or other events outside our control.</p>

      <h2>4. Shipping charges</h2>
      <p>Shipping charge: <strong>{p.shippingCharge}</strong>. Any applicable charge is shown at checkout before you pay.</p>

      <h2>5. Order tracking</h2>
      <p>You can follow the status of your order (Confirmed, Packing, Out for Shipment, Shipped, Delivered) anytime from <strong>My Orders</strong> after logging in.</p>

      <h2>6. Cash on Delivery</h2>
      <p>{p.codAvailable ? "Cash on Delivery is available for eligible orders. Please keep the exact amount ready at the time of delivery." : "Cash on Delivery is currently not available."}</p>

      <h2>7. Delivery and inspection</h2>
      <ul>
        <li>Please inspect the package in the presence of the delivery person and note any visible damage.</li>
        <li>Report transit damage, missing parts or a wrong item within {p.damageReportHours} hours of delivery with photos, as described in our Cancellation &amp; Refund Policy.</li>
        <li>Someone must be available at the address to receive the order. Repeated failed delivery attempts may lead to cancellation.</li>
      </ul>

      <h2>8. Assembly</h2>
      <p>Some furniture is delivered ready to use and some needs simple assembly. Instructions are included in the package where applicable.</p>

      <h2>9. Contact</h2>
      <p>For shipping queries write to <a href={`mailto:${business.supportEmail}`}>{business.supportEmail}</a> or call {business.phone}.</p>
    </LegalLayout>
  );
};

export default ShippingPolicy;
