import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#22c55e",
          foreground: "var(--primary-foreground)",
        },
        danger: "#ef4444",
        warning: "#f97316",
        foreground: "var(--foreground)",
        border: "var(--border)",
        ring: "var(--ring)",
        surface: {
          DEFAULT: "#f8fafc",
          0: "var(--surface-0)",
          2: "var(--surface-2)",
          3: "var(--surface-3)",
        },
        background: "var(--background)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        muted: {
          foreground: "var(--muted-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: "var(--destructive)",
        accent: {
          foreground: "var(--accent-foreground)",
        },
        "input-surface": "var(--input-surface)",
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      borderRadius: {
        "2xl": "1rem",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.08)",
      },
      maxWidth: {
        mobile: "390px",
      },
    },
  },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        ".shadow-overview-metric": {
          boxShadow: "var(--overview-metric-card-shadow)",
        },
        ".shadow-card-edge": {
          boxShadow: "var(--card-edge-shadow)",
        },
        ".shadow-ff-surface-2": {
          boxShadow: "var(--ff-shadow-2)",
        },
        ".shadow-ff-surface-3": {
          boxShadow: "var(--ff-shadow-3)",
        },
        ".shadow-ff-surface-4": {
          boxShadow: "var(--ff-shadow-4)",
        },
        ".shadow-ff-surface-5": {
          boxShadow: "var(--ff-shadow-5)",
        },
        ".bg-ff-surface-2": {
          backgroundColor: "var(--ff-surface-2)",
        },
        ".bg-ff-surface-3": {
          backgroundColor: "var(--ff-surface-3)",
        },
        ".bg-ff-surface-4": {
          backgroundColor: "var(--ff-surface-4)",
        },
        ".bg-ff-surface-5": {
          backgroundColor: "var(--ff-surface-5)",
        },
        ".shadow-button-tone-primary-rest": {
          boxShadow: "var(--button-tone-primary-stack-rest)",
        },
        ".shadow-button-tone-primary-hover": {
          boxShadow: "var(--button-tone-primary-stack-hover)",
        },
        ".shadow-button-tone-green-rest": {
          boxShadow: "var(--button-tone-green-stack-rest)",
        },
        ".shadow-button-tone-green-hover": {
          boxShadow: "var(--button-tone-green-stack-hover)",
        },
        ".shadow-button-tone-red-rest": {
          boxShadow: "var(--button-tone-red-stack-rest)",
        },
        ".shadow-button-tone-red-hover": {
          boxShadow: "var(--button-tone-red-stack-hover)",
        },
        ".shadow-button-tone-gold-rest": {
          boxShadow: "var(--button-tone-gold-stack-rest)",
        },
        ".shadow-button-tone-gold-hover": {
          boxShadow: "var(--button-tone-gold-stack-hover)",
        },
        ".shadow-button-tone-orange-rest": {
          boxShadow: "var(--button-tone-orange-stack-rest)",
        },
        ".shadow-button-tone-orange-hover": {
          boxShadow: "var(--button-tone-orange-stack-hover)",
        },
        ".shadow-segmented-track": {
          boxShadow: "var(--segmented-track-shadow)",
        },
        ".shadow-segmented-thumb": {
          boxShadow: "var(--segmented-thumb-shadow)",
        },
        ".shadow-input-edge": {
          boxShadow: "var(--input-edge-shadow)",
        },
        ".shadow-switch-track": {
          boxShadow: "var(--switch-track-shadow)",
        },
        ".shadow-switch-track-on": {
          boxShadow: "var(--switch-track-on-shadow)",
        },
        ".shadow-switch-thumb-off": {
          boxShadow: "var(--switch-thumb-off-shadow)",
        },
        ".shadow-switch-thumb-on": {
          boxShadow: "var(--switch-thumb-on-shadow)",
        },
      });
    }),
  ],
};

export default config;
