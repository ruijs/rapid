const { pathsToModuleNameMapper } = require("ts-jest");
const { compilerOptions } = require("./tsconfig-node");

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  modulePaths: [compilerOptions.baseUrl],
  moduleNameMapper: {
    "^~/(.*)$": "<rootDir>/app/$1",
  },
};
