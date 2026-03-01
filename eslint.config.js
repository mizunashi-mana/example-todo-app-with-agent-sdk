import { buildConfig } from "@example-todo-app/eslint-config";

export default [
  ...buildConfig({
    entrypointFiles: [
      "packages/todo-app/src/index.ts",
      "packages/todo-app/src/main.ts",
      "packages/web-ui/src/main.tsx",
    ],
  }),
];
