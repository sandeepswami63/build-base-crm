import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        finexy: {
          orange: "#f95932",
          orangeLight: "#fff0ec",
          bg: "#f3f4f6", // very light gray body background
          text: "#1e293b",
          muted: "#94a3b8",
        }
      },
    },
  },
  plugins: [],
};
export default config;
