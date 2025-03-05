---
title: "TypeScript, ESLint, and Prettier: A Setup Guide"
summary: "Setup your project with TypeScript, ESLint, and Prettier to ensure code quality and consistency."
createdAt: "2025-03-05"
tags: ["tooling", "ts"]
image: "/images/posts/general/tooling.png"
---

## Introduction

When you start a new TypeScript project, you'll want to set up some tools to help you maintain the codebase better. Here are three important tools I use in every project:

1. **TypeScript**: The programming language your code is written in.
2. **ESLint**: A linter that checks code for warnings and errors
3. **Prettier**: A code formatter that ensures consistent code style

Each tool has its specific responsibility, and when configured correctly, they work together to create a powerful development environment.

## Understanding Each Tool's Role

### TypeScript

- Provides static type checking and type definitions
- Catches type-related errors before runtime
- Enables better IDE support and autocompletion

### ESLint

- Finds problematic patterns in your code
- Catches potential bugs and logic errors

### Prettier

- Handles code style concerns (spacing, line breaks, etc.)
- Eliminates debates about code formatting

## Setting Up the Project

Let's create a new project and set up these tools step by step.

### 1. Project Initialization

```bash
mkdir ts-project
cd ts-project
pnpm init
```

### 2. Installing Dependencies

```bash
pnpm add -D typescript

pnpm add -D prettier

pnpm create @eslint/config
```

### 3. TypeScript Configuration

This is just a basic configuration. You can customize it further based on your project's needs.

```json filename-tsconfig.json
/* Visit https://aka.ms/tsconfig to read more about this file */
{
  "compilerOptions": {
    /* Projects */
    "incremental": true /* It will cache the result of the last compilation and reuse it when the source files have not changed. */,

    /* Modules */
    "target": "ES2020" /* Set the JavaScript language version for emitted code. For example, if you use ES2020, the generated code will preserve ES2020 features such as optional chaining, nullish coalescing */,
    "module": "NodeNext" /* This determines the module system used in the output. For example, if you use commonjs, the generated code will use require and module.exports. */,
    "moduleResolution": "NodeNext" /* Determines which algorithm to use to resolve modules during compilation. "NodeNext" follows Node.js's ESM resolution strategy, considering file extensions and the nearest package.json's `type` field to determine whether a module should be treated as ESM or CommonJS. */,

    /* Emit */
    "declaration": true /* Generate `.d.ts` (declaration) files, which describe the types of exported code. Useful for creating libraries or sharing types without exposing source code. */,
    "declarationMap": true /* Better debugging experience by mapping declarations to their original source files. */,
    "sourceMap": true /* Create source map files for emitted JavaScript files. */,

    /* Type Checking */
    "strict": true /* Enable all strict type-checking options. */,
    // "noImplicitAny": true /* Enable error reporting for expressions and declarations with an implied 'any' type. */,
    /* Completeness */
    "skipLibCheck": true /* Skips type checking of declaration (`.d.ts`) files in `node_modules`, reducing build time and avoiding unnecessary type errors from external libraries. */,

    "rootDir": "./src" /* Specify the root folder that includes all your .ts files. */,
    "baseUrl": "./src" /* Sets the base directory for resolving non-relative module imports. For example, if `rootDir` is set to `./src`, imports like `import { helper } from "utils/helper"` will resolve to `./src/utils/helper`. */,
    "outDir": "./dist"
  }
}
```

### 4. ESLint Configuration

The command `pnpm create @eslint/config` will create a `eslint.config.mjs` file with the following content with the exception of rules. You can customize the rules based on your project's needs.

```js
import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {files: ["**/*.{js,mjs,cjs,ts}"]},
  {languageOptions: { globals: globals.node }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    "rules": {
      "no-unused-vars": "off", // Note: you must disable the base rule as it can report incorrect errors
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
```

### 5. Prettier Configuration

Create `.prettierrc` file manually in the root of the project. Keep it simple for demo purposes.

```json
{
  "singleQuote": true
}
```

### 6. Add scripts to package.json

```json 
{
  "scripts": {
    "ts:check": "tsc --noEmit",
    "ts:build": "tsc",
    "format:check": "prettier --check \"src/**/*.ts\"",
    "format:write": "prettier --write \"src/**/*.ts\"",
    "lint:check": "eslint ."
  }
}
```

Scripts are easier to run and remember than long commands. You can directly call them in your terminal but also they can be used in your CI/CD pipeline or Git hooks.

## Seeing the Tools in Action

Let's create some example code to see how these tools work together.

```ts filename-index.ts
export type Person = {
  name: string;
  age: number;
};

const person: Person = {
  name: "John",
        age: "30",
};
```

Running our scripts will highlight several issues:

1. **TypeScript Errors:**

   - Type 'string' is not assignable to type 'number'

2. **Prettier Formatting Issues:**

   - Prettier won't give you exact error messages, but it will warn you there's a formatting issue in the file and it can directly fix it with `format:write` command.

3. **ESLint Warnings:**
   - Unused variable 'person'

## Ensuring code quality with Git hooks

We will set pre-commit hooks to run these checks before allowing a commit. This ensures that only properly formatted and linted code is committed and you won't have to worry about them in code reviews.

First, install husky and lint-staged:

```bash
pnpm add -D husky lint-staged
pnpx husky init
```

This will create a `.husky` directory with some scripts and modify the `package.json` file to include `prepare` command.

Create a `.lintstagedrc` file in the root of the project to specify what commands to run on which files:

```json 
{
  "*.{ts,tsx}": [
    "pnpm run ts:check",
    "pnpm run format:check",
    "pnpm run lint:check"
  ]
}
```

Then modify the `.husky/pre-commit` file that was created:

```bash 
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm exec lint-staged
```

Now when you try to commit, husky will run lint-staged, which will run the specified commands on the `.lintstagedrc` file. 

Keep in mind that automated tools shouldn't commit changes without your approval. That's why we are only using check commands, even with code style (prettier) formatting.
You’ll receive warnings and make thoughtful corrections.

## Benefits of installing these tools over IDE plugins

By having these tools as project dependencies, you can ensure consistency across all developers' environments.

You may not force developers to use a specific IDE or editor, but you can enforce a consistent set of tools and configurations for the project.

## Conclusion

While the initial setup might seem complex, the long-term benefits in code quality and developer productivity make it worth the effort.
As you get more comfortable with the tools, you can create your own custom rules and discover plugins that help maintain the codebase.

## References

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [ESLint Documentation](https://eslint.org/docs/user-guide/getting-started)
- [Prettier Documentation](https://prettier.io/docs/index.html)
