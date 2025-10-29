// eslint.config.js
import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import jsxA11y from "eslint-plugin-jsx-a11y";
import importPlugin from "eslint-plugin-import";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist", "build", "coverage", "node_modules"]),
  {
    files: ["**/*.{js,jsx}"],
    ignores: [],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },

    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "jsx-a11y": jsxA11y,
      import: importPlugin,
    },

    // Quan trọng: thêm cấu hình React để bắt lỗi JSX, undefined component, v.v.
    extends: [
      js.configs.recommended,
      react.configs.recommended,
      react.configs["jsx-runtime"], // để không bắt lỗi “React phải in scope”
      reactHooks.configs["recommended-latest"],
      reactRefresh.configs.vite,
      jsxA11y.configs.recommended,
      importPlugin.configs.recommended,
    ],

    settings: { react: { version: "detect" } },

    rules: {
      // Báo lỗi thiếu import / biến chưa khai báo
      "no-undef": "error",
      "react/jsx-no-undef": "error",
      "import/no-unresolved": "error",

      // Cảnh báo code smell thường gặp
      "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
      "react/prop-types": "off", // nếu không dùng PropTypes
    },
  },
]);
