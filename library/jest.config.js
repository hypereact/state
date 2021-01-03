module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  collectCoverage: true,
  coverageDirectory: "./build/lcov",
  coverageReporters: ["lcov"]
};