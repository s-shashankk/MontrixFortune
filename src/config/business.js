// ONE place for your business details. Every policy page, the footer and the contact page read from here.
// >>> Replace every value marked CHANGE ME with your real details before going live. <<<
// The policy text describes the promises below; only keep a promise here if you will actually honour it.
export const business = {
  brandName: "Montrix Fortune",
  legalName: "Montrix Fortune",                        // CHANGE ME: registered business / proprietor name
  // Addresses shown on the Contact page and footer. The first one is used in the legal pages.
  addresses: [
    { label: "Office Address", lines: ["#127/128, 1st Main, Jyothi Nagar, Nayandalli Extension,", "Mysore Road, Bengaluru 560039"] },
    { label: "Address 2", lines: ["#143, 17th Cross, Dhodanna Estate, Peenya 2nd Stage,", "Bengaluru 560058"] },
  ],
  city: "Bengaluru",                                   // used for "courts at ..." in the Terms

  supportEmail: "support@montrixfortune.com",
  salesEmail: "sales@montrixfortune.com",
  phone: "+91 98806 17777",                            // main number (used in policy pages)
  phones: [
    { label: "Mobile", display: "+91 98806 17777", tel: "+919880617777" },
    { label: "Mobile", display: "+91 98804 27777", tel: "+919880427777" },
    { label: "Landline", display: "080 2675 6744", tel: "+918026756744" },
  ],
  whatsappNumber: "919880617777",                      // WhatsApp chat link (country code + number, digits only)
  whatsappMessage: "Hello Montrix Fortune, I need help with ",
  supportHours: "Monday to Saturday, 10:00 AM to 6:00 PM IST",
  gstin: "",                                           // CHANGE ME: your GSTIN (shown only if filled in)

  // Grievance Officer (required for Indian e-commerce sites). Falls back to the support details if left empty.
  grievanceOfficer: { name: "", email: "", phone: "" }, // CHANGE ME

  policies: {
    processingDays: "1-2 business days",
    deliveryDays: "5-10 business days",                // typical delivery time after dispatch
    returnWindowDays: 7,                               // days after delivery to report damaged / defective / wrong item
    damageReportHours: 48,                             // report visible transit damage within this time
    refundTime: "5-7 business days",
    codAvailable: true,
    shippingCharge: "Free",
  },

  lastUpdated: "16 October 2026",
};

export const whatsappLink = (text) =>
  `https://wa.me/${business.whatsappNumber}?text=${encodeURIComponent(text ?? business.whatsappMessage)}`;

// Single-line address used in legal pages.
business.addressLines = [business.addresses[0].lines.join(" ")];

export const grievance = () => ({
  name: business.grievanceOfficer.name || business.legalName,
  email: business.grievanceOfficer.email || business.supportEmail,
  phone: business.grievanceOfficer.phone || business.phone,
});
