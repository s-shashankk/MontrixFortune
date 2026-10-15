import LegalLayout from "../legal/LegalLayout";
import { business, grievance } from "../../config/business";

const ContactUs = () => {
  const g = grievance();
  return (
    <LegalLayout
      title="Contact Us"
      showUpdated={false}
      intro="We are happy to help with orders, deliveries, returns or product questions."
    >
      <h2>Customer support</h2>
      <p>Email: <a href={`mailto:${business.supportEmail}`}>{business.supportEmail}</a></p>
      <p>Phone: <a href={`tel:${business.phone.replace(/\s/g, "")}`}>{business.phone}</a></p>
      <p>Hours: {business.supportHours}</p>
      <p>Please include your order number so we can help you faster.</p>

      <h2>Business address</h2>
      <p>
        {business.legalName}
        {business.addressLines.map((line) => (<span key={line}><br />{line}</span>))}
      </p>
      {business.gstin ? <p>GSTIN: {business.gstin}</p> : null}

      <h2>Grievance Officer</h2>
      <p>
        Name: {g.name}<br />
        Email: <a href={`mailto:${g.email}`}>{g.email}</a><br />
        Phone: {g.phone}
      </p>
      <p>We acknowledge complaints within 48 hours and aim to resolve them within one month.</p>
    </LegalLayout>
  );
};

export default ContactUs;
