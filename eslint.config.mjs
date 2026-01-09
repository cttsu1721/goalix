import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated service worker files from next-pwa
    "public/sw.js",
    "public/workbox-*.js",
  ]),
  // Custom rules overrides
  {
    rules: {
      // React Compiler strict mode rules - treat as warnings for gradual migration
      // These patterns are valid React but trigger the strict compiler checks
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react-hooks/immutability": "warn",
      // Date.now() and similar are commonly used in render for display purposes
      "react-hooks/purity": "warn",
    },
  },
]);

export default eslintConfig;
