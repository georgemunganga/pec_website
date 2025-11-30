const env = (key: string, fallback: string) => import.meta.env[key] || fallback;

export const APP_METADATA = {
  title: env("VITE_APP_TITLE", "Pure Essence Apothecary"),
  description:
    "Pure Essence Apothecary delivers premium skincare and beauty rituals inspired by clean botanicals and modern self-care.",
  logo: "/logo.png",
  url: env("VITE_APP_URL", "https://pureessenceapothecary.com"),
  social: {
    instagram: "https://instagram.com/pureessenceapothecary",
    facebook: "https://facebook.com/pureessenceapothecary",
  },
};

export const THEME_TOKENS = {
  radius: {
    pill: "999px",
    full: "9999px",
    card: "1.5rem",
  },
  spacing: {
    page: "2.5rem",
    section: "4rem",
  },
};

export const SUPPORT_INFO = {
  email: env("VITE_SUPPORT_EMAIL", "support@pureessenceapothecary.com"),
  phone: env("VITE_SUPPORT_PHONE", "097 7883578"),
  address: {
    street: "Kafue Rd Balmoral",
    city: "Chilanga",
    postalCode: "10101",
    country: "Zambia",
  },
};
