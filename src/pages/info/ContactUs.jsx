import LegalLayout from "../legal/LegalLayout";
import { business, grievance, whatsappLink } from "../../config/business";

const ContactUs = () => {
  const g = grievance();
  return (
    <LegalLayout
      title="Contact Us"
      showUpdated={false}
      intro="We are happy to help with orders, deliveries, returns, product questions or bulk and project enquiries."
    >
      <h2>Customer support</h2>
      <p>Email: <a href={`mailto:${business.supportEmail}`}>{business.supportEmail}</a></p>
      <p>Hours: {business.supportHours}</p>
      <p>Please include your order number so we can help you faster.</p>

      <h2>Sales and enquiries</h2>
      <p>Email: <a href={`mailto:${business.salesEmail}`}>{business.salesEmail}</a></p>

      <h2>Call us</h2>
      {business.phones.map((p) => (
        <p key={p.tel}>{p.label}: <a href={`tel:${p.tel}`}>{p.display}</a></p>
      ))}

      <h2>Chat on WhatsApp</h2>
      <p>
        <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
          Message us on WhatsApp ({business.phones[0].display})
        </a>
      </p>

      <h2>Our addresses</h2>
      {business.addresses.map((address) => (
        <p key={address.label}>
          <strong>{address.label}</strong><br />
          {business.legalName}
          {address.lines.map((line) => (<span key={line}><br />{line}</span>))}
        </p>
      ))}
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
