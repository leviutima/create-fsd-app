import boundaries from "eslint-plugin-boundaries";
import tseslint from "typescript-eslint";

export default tseslint.config({
  files: ["src/**/*.{ts,tsx}"],
  ignores: ["src/main.tsx"],
  extends: [tseslint.configs.recommended],
  languageOptions: {
    parserOptions: {
      ecmaFeatures: { jsx: true },
    },
  },
  plugins: { boundaries },
  settings: {
    "import/resolver": {
      typescript: true,
    },
    "boundaries/elements": [
      { type: "app", pattern: "src/app/*" },
      { type: "pages", pattern: "src/pages/*" },
      { type: "widgets", pattern: "src/widgets/*" },
      { type: "features", pattern: "src/features/*" },
      { type: "entities", pattern: "src/entities/*" },
      { type: "shared", pattern: "src/shared/*" },
    ],
  },
  rules: {
    "boundaries/element-types": [
      "error",
      {
        default: "disallow",
        rules: [
          { from: "app", allow: ["pages", "widgets", "features", "entities", "shared"] },
          { from: "pages", allow: ["widgets", "features", "entities", "shared"] },
          { from: "widgets", allow: ["features", "entities", "shared"] },
          { from: "features", allow: ["entities", "shared"] },
          { from: "entities", allow: ["shared"] },
          { from: "shared", allow: ["shared"] },
        ],
      },
    ],
    "boundaries/entry-point": [
      "error",
      {
        default: "disallow",
        rules: [{ target: ["*"], allow: ["index.ts", "index.tsx"] }],
      },
    ],
  },
});
