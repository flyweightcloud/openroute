module.exports = {
    root: true,
    env: {
        es6: true,
        jest: true,
        node: true,
    },
    parser: "@typescript-eslint/parser",
    plugins: [
        "@typescript-eslint",
    ],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
    ],
    rules: {
        "indent": ["error", 4,],
        "quotes": ["error", "double",],
        "comma-dangle": ["error", "always",],
        "semi-style": ["error", "last",],
        "no-unused-vars": ["error", { "argsIgnorePattern": "^_", },],
        "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_", },],
    },
};