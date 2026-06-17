/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        eco: {
          primary: "#0066FF", // Electric Blue
          primaryDeep: "#004ecc", // Deep Electric Blue
          accentGreen: "#9FCE1A", // Vibrant Green
          accentGreenDeep: "#82a815", // Deep Vibrant Green
          bgBeige: "#FFF3DD", // Urban Beige
          ink: "#0A1118", // Dark Charcoal / Ink
          muted: "#4B5E70", // Muted Blue-Grey
          reward: "#FBBF24", // Reward Gold
          surface: "#FFFFFF", // White
          soft: "#FFF8EC", // Soft light warm beige tint
          mint: "#E6F0FF", // Light Electric Blue / Soft Ice tint
        }
      }
    },
  },
  plugins: [],
}
