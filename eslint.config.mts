import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import type { TSESLint } from "@typescript-eslint/utils";

const config: TSESLint.FlatConfig.Config[] = [
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  { ignores: ["cdk.out/**"] },
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "no-unused-vars": "off", // Disable base rule
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          "args": "all",
          "argsIgnorePattern": "^_",
          "caughtErrors": "all",
          "caughtErrorsIgnorePattern": "^_",
          "destructuredArrayIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "ignoreRestSiblings": true
        }
      ]
    }
  }
];

export default config; 