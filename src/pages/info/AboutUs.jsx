import LegalLayout from "../legal/LegalLayout";
import { business } from "../../config/business";

const AboutUs = () => (
  <LegalLayout
    title="About Us"
    showUpdated={false}
    intro={`${business.brandName} brings thoughtfully made furniture and home decor to Indian homes at honest prices.`}
  >
    <h2>What we do</h2>
    <p>From sofas and beds to dining sets, mattresses and decor, we curate pieces that balance comfort, durability and style for everyday living.</p>

    <h2>Our promise</h2>
    <ul>
      <li>Fair prices in INR, inclusive of applicable taxes.</li>
      <li>Secure online payments through Razorpay, plus Cash on Delivery on eligible orders.</li>
      <li>Delivery across India with order tracking in My Orders.</li>
      <li>Responsive support when you need help.</li>
    </ul>

    <h2>Get in touch</h2>
    <p>Write to <a href={`mailto:${business.supportEmail}`}>{business.supportEmail}</a> or visit our Contact Us page.</p>
  </LegalLayout>
);

export default AboutUs;
