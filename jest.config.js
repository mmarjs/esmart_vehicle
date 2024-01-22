module.exports = {
  preset: '@vue/cli-plugin-unit-jest',
  transform: {
    '^.+\\.vue$': '@vue/vue3-jest'
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: ["src//*.{js,jsx,ts,tsx}", "!src//.d.ts"],
  transformIgnorePatterns: ["/node_modules/(?!vue-awesome)"],
}
