import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  ...compat.config({
    rules: {
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-unused-vars": "off",
        "react-hooks/exhaustive-deps": "off",
        "@typescript-eslint/no-unused-expressions": "off",
        "react/no-unescaped-entities": "off",
        "prefer-const": "off",
    },
    ignorePatterns: ["app/components/ui"]
  }),
];

export default eslintConfig;
