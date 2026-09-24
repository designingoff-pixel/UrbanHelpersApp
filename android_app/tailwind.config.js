/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#004AC6",
          teal: "#006B5F",
        },
        surface: {
          dark: "#0B1620",
          darkAlt: "#0F2027",
          card: "#1B2B3B",
        },
        text: {
          primary: "#FFFFFF",
          secondary: "#C3C6D7",
          tertiary: "#B4C5FF",
          accent: "#D4E4F9",
          muted: "#6B7280",
          body: "#111827",
        },
        accent: {
          indigo: "#4338CA",
          amber: "#D97706",
          emerald: "#059669",
          teal: "#0D9488",
          blue: "#2563EB",
        },
        danger: "#FFB4AB",
        background: {
          light: "#F7F8FA",
          card: "#FFFFFF",
        },
      },
      fontFamily: {
        heading: ["PlusJakartaSans-Bold"],
        "heading-semibold": ["PlusJakartaSans-SemiBold"],
        body: ["Manrope-Regular"],
        "body-medium": ["Manrope-Medium"],
      },
      borderRadius: {
        pill: "9999px",
        card: "30px",
        "card-lg": "36px",
      },
    },
  },
  plugins: [],
};
