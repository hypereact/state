module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  modulePathIgnorePatterns: ['<rootDir>/build/'],
  collectCoverage: true,
  coverageDirectory: "./build/coverage",
  coverageReporters: ["json"]
};