/** @type {import('jest').Config} */
const config = {
  preset: "ts-jest",
  testEnvironment: "node",
  coverageProvider: "v8",
  roots: ["<rootDir>/src"],
  testMatch: ["**/*.test.ts", "**/*.test.tsx"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", {}],
  },
  collectCoverageFrom: [
    "src/services/utils/**/*.{ts,tsx}",
    "!src/services/utils/tech-icons.ts",
    "!**/*.test.ts",
    "!**/node_modules/**",
  ],
};

export default config;
