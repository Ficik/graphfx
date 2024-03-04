module.exports = {
  ignorePatterns: [
    "dist",
    "node_modules",
    ".eslintrc.js",
    "samples/vite.config.js",
  ],
  env: {
    browser: true,
    es2021: true,
  },
  extends: "standard-with-typescript",

  overrides: [],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    "@typescript-eslint/semi": [2, "always"],
  },
};
