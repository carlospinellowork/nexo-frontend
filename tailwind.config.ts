import { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "bg-start": "#0b1220",
        "bg-end": "#0e1a2f",
        background: "#0b1220",
        panel: "#111c2d",
        "border-ui": "#1e293b",
        primary: "#14b8a6",
        info: "#2563eb",
        warning: "#f59e0b",
        danger: "#f43f5e",
        "text-primary": "#e2e8f0",
        "text-secondary": "#94a3b8",
      },
      borderRadius: {
        md: "12px",
      },
    },
  },
  plugins: [],
} satisfies Config;
