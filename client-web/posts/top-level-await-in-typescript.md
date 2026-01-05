---
title: "Top level await in TypeScript"
summary: "Use await at the top level of a module without wrapping it inside an async function"
createdAt: "2025-02-13"
tags: ['ts']
image: '/images/posts/general/ts.png'
---

In this post, we’ll explore how to use top-level `await` in **TypeScript**, including the necessary **tsconfig** setup, how to run it with **ts-node**, and configuring **nodemon** for auto-reloading.

Top level await particularly useful for the following scenarios before the application starts:
- Getting application configuration
- Database connections
- Initializing services


## What is needed to use top-level await in Node.js?

- Top-level await was introduced in Node.js version 14. Your Node.js version should be 14 or higher.
- Package.json should have `"type": "module"` to enable ES module support.

## What is needed to use top-level await in TypeScript?

When using TypeScript, your `tsconfig.json` file should have the following configuration:

```json filename-tsconfig
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "target": "ES2017",

    "outDir": "./dist"
  }
}
```

Why this configuration?
- `module` and `moduleResolution` are used to determine how TypeScript resolves module imports. Setting them to `NodeNext` allows TypeScript to understand ES module syntax.
- `target` is used to specify the ECMAScript version for the output code. Setting it to `ES2017` is required because top-level `await` is an ES2017 feature. Earlier versions of ECMAScript do not support it so if you target a lower version, TypeScript will throw an error.


## Configuring ts-node to support ES modules

Since top-level `await` is an ES module feature, we've set up project to use ES modules.
Unfortunately, ts-node does not natively support ES modules by default. It only supports CommonJS modules by default. We need to configure ts-node to support ES modules.
 
First, let's install the necessary packages:

```bash
npm install --save-dev typescript ts-node
```

Usually, you would run TypeScript files with `ts-node` like this:

```bash
npx ts-node src/index.ts
```

However, to use ES modules with `ts-node`, you need use loader:

```bash
npx ts-node --loader ts-node/esm src/index.ts
```

## Configuring nodemon with ts-node

For development, you're likely using `nodemon` to auto-reload your application when files change. 

Configure your **nodemon.json** file as below to use `nodemon` with `ts-node` and ES modules:

```json filename-nodemon
{
  "watch": ["src"],
  "ext": "ts",
  "execMap": {
    "ts": "node --loader ts-node/esm"
  }
}
```

This was all about using top-level `await` in TypeScript. Long-term-support (LTS) versions of Node.js was supporting if for a while now. It's a great feature to use in your projects.