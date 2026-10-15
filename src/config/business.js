// ONE place for your business details. Every policy page, the footer and the contact page read from here.
// >>> Replace every value marked CHANGE ME with your real details before going live. <<<
// The policy text describes the promises below; only keep a promise here if you will actually honour it.
export const business = {
  brandName: "Montrix Fortune",
  legalName: "Montrix Fortune",                        // CHANGE ME: registered business / proprietor name
  addressLines: ["Bengaluru, Karnataka, India"],       // CHANGE ME: full registered address with PIN code
  city: "Bengaluru",                                   // used for "courts at ..." in the Terms
  supportEmail: "support@montrixfortune.com",          // CHANGE ME: a mailbox you really read
  phone: "+91 98765 43210",                            // CHANGE ME: real support number
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

  lastUpdated: "14 October 2026",
};

export const grievance = () => ({
  name: business.grievanceOfficer.name || business.legalName,
  email: business.grievanceOfficer.email || business.supportEmail,
  phone: business.grievanceOfficer.phone || business.phone,
});
