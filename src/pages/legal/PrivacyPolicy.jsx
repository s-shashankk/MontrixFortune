import LegalLayout from "./LegalLayout";
import { business, grievance } from "../../config/business";

const PrivacyPolicy = () => {
  const g = grievance();
  return (
    <LegalLayout
      title="Privacy Policy"
      intro={`${business.brandName} ("we", "us") respects your privacy. This policy explains what personal information we collect when you use our website, why we collect it, who we share it with, and the choices you have.`}
    >
      <h2>1. Information we collect</h2>
      <ul>
        <li><strong>Account details:</strong> your name, email address, phone number and password. Passwords are stored only in encrypted (hashed) form; we cannot read them.</li>
        <li><strong>Delivery details:</strong> the names, phone numbers and addresses you save for shipping.</li>
        <li><strong>Order information:</strong> items ordered, order value, order status and payment status.</li>
        <li><strong>Payment information:</strong> payments are processed by Razorpay. Your card, UPI or bank details are entered on Razorpay's secure page and are not stored on our servers. We receive only a payment reference and its status.</li>
        <li><strong>Technical information:</strong> basic data sent by your browser such as IP address, browser type and pages requested, used for security and troubleshooting.</li>
        <li><strong>Messages:</strong> anything you send to our support team by email or phone.</li>
      </ul>

      <h2>2. How we use your information</h2>
      <ul>
        <li>To create and manage your account and sign you in.</li>
        <li>To process, deliver and support your orders, including returns and refunds.</li>
        <li>To confirm payments and prevent fraud or misuse.</li>
        <li>To contact you about your order or respond to your questions.</li>
        <li>To meet legal, tax and accounting obligations.</li>
        <li>To maintain and improve the website.</li>
      </ul>

      <h2>3. Who we share it with</h2>
      <p>We do not sell your personal information. We share it only as needed to run the service:</p>
      <ul>
        <li><strong>Payment provider:</strong> Razorpay, to process your payment.</li>
        <li><strong>Delivery partners:</strong> your name, phone number and address, so your order can be delivered.</li>
        <li><strong>Hosting and technology providers</strong> that store or process data on our behalf under confidentiality obligations.</li>
        <li><strong>Authorities</strong> when required by law or to protect our rights and the safety of others.</li>
      </ul>

      <h2>4. Cookies and browser storage</h2>
      <p>
        We store a sign-in token in your browser's local storage so you stay logged in, and we use it to show your cart.
        Our checkout and page fonts are loaded from third parties (Razorpay and Google Fonts), which may receive technical
        information such as your IP address when those items load. We do not use advertising or cross-site tracking cookies.
        You can clear your browser storage at any time; you will then need to sign in again.
      </p>

      <h2>5. Security</h2>
      <p>
        We use HTTPS, encrypted password storage and access controls to protect your data. No online service can promise
        absolute security, so please choose a strong password and keep it private.
      </p>

      <h2>6. How long we keep data</h2>
      <p>
        We keep account data while your account is active. Order and payment records are kept for as long as required by
        applicable tax, accounting and consumer-protection laws. After that they are deleted or anonymised.
      </p>

      <h2>7. Your choices and rights</h2>
      <p>
        You can view and update your delivery addresses in your account. You may ask us to access, correct or delete your
        personal information, or to withdraw consent for optional uses, by writing to us at the address below. Some records
        must be retained by law, and we will tell you if that applies to your request.
      </p>

      <h2>8. Children</h2>
      <p>Our website is meant for adults. We do not knowingly collect information from anyone under 18.</p>

      <h2>9. Changes to this policy</h2>
      <p>We may update this policy from time to time. The date at the top shows when it last changed.</p>

      <h2>10. Contact and grievances</h2>
      <p>For privacy questions or complaints, contact our Grievance Officer:</p>
      <p>
        <strong>{g.name}</strong><br />
        Email: <a href={`mailto:${g.email}`}>{g.email}</a><br />
        Phone: {g.phone}<br />
        {business.addressLines.join(", ")}<br />
        Hours: {business.supportHours}
      </p>
      <p>We aim to acknowledge complaints within 48 hours and resolve them within 30 days.</p>
    </LegalLayout>
  );
};

export default PrivacyPolicy;
