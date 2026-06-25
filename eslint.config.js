import eslint from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import globals from "globals";

export default [
  {
    ignores: ["dist/**", "coverage/**", "node_modules/**"],
  },
  eslint.configs.recommended,
  {
    files: ["scripts/**/*.mjs", "eslint.config.js"],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
      },
      globals: {
        ...globals.browser,
        chrome: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      "@typescript-eslint/explicit-function-return-type": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "no-restricted-globals": [
        "error",
        {
          name: "fetch",
          message: "TinyTab has a zero-network privacy contract.",
        },
        {
          name: "XMLHttpRequest",
          message: "TinyTab has a zero-network privacy contract.",
        },
        {
          name: "WebSocket",
          message: "TinyTab has a zero-network privacy contract.",
        },
        {
          name: "EventSource",
          message: "TinyTab has a zero-network privacy contract.",
        },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "CallExpression[callee.object.name='navigator'][callee.property.name='sendBeacon']",
          message: "TinyTab has a zero-network privacy contract.",
        },
      ],
    },
  },
];
