// Single source of truth for company facts, links and launch flags.
// Anything marked TODO must be confirmed before the site goes live.

export const site = {
  name: "AICA",
  longName: "Adaptive Intelligent Care App",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://aicaglobal.in",
  // Where images (share card, logo) are actually served. Until aicaglobal.in points at Vercel,
  // that domain still serves the old site, so use Vercel's production address. Vercel sets
  // VERCEL_PROJECT_PRODUCTION_URL automatically, and it switches to the custom domain once added.
  assetUrl:
    process.env.NEXT_PUBLIC_ASSET_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.NEXT_PUBLIC_SITE_URL ?? "https://aicaglobal.in"),

  company: {
    legalName: "Beyond Quantum Technologies Pvt. Ltd.",
    // TODO: add the CIN once incorporation is confirmed on MCA21. Lines that use it are hidden while null.
    cin: null as string | null,
    address: "A-23, Nirala Nagar, Lucknow, Uttar Pradesh 226020, India",
    // TODO: name a real person as Grievance Officer (DPDP Act / IT Rules expectation).
    grievanceOfficer: "AICA Privacy and Grievance Desk",
    // TODO: confirm with your lawyer.
    jurisdiction: "Lucknow, Uttar Pradesh",
  },

  contact: {
    // TODO: switch to hello@aicaglobal.in once domain email is set up.
    email: "adaptiveintelligentcareapp@gmail.com",
    phone: "+91 63881 73047",
    phoneHref: "tel:+916388173047",
    whatsapp: "916388173047",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=A-23%2C+Nirala+Nagar%2C+Lucknow%2C+Uttar+Pradesh%2C+India",
  },

  social: {
    instagram: "https://www.instagram.com/aica_global/",
    // TODO: replace with a LinkedIn *company* page.
    linkedin: "https://www.linkedin.com/in/aica-global-bb50a9424/",
    facebook: "https://www.facebook.com/profile.php?id=61592473816309",
  },

  // Prototypes live on the old server. When aicaglobal.in moves to Vercel, point
  // a subdomain (e.g. demo.aicaglobal.in) at the old server and set NEXT_PUBLIC_DEMO_URL.
  demoBase: process.env.NEXT_PUBLIC_DEMO_URL ?? "https://aicaglobal.in/demo",
  demos: {
    patient: { path: "/patient/", ready: true },
    pharmacy: { path: "/pharmacy/", ready: false }, // currently a "not ready yet" placeholder
    clinic: { path: "/clinic/", ready: true },
  },

  // Team shown on /about. TODO: confirm names, roles and add photos to /public/team/.
  team: [
    {
      name: "Vyom Ahuja",
      role: { en: "Founder", hi: "संस्थापक" },
      photo: null as string | null,
      linkedin: null as string | null,
    },
  ],

  // Pricing shown on /pricing. TODO: confirm every number before launch.
  pricing: {
    patientPro: 1000, // ₹ per month per profile
  },
} as const;

export const demoUrl = (k: keyof typeof site.demos) => `${site.demoBase}${site.demos[k].path}`;
export const whatsappUrl = (text: string) =>
  `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(text)}`;
