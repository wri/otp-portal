import { defineConfig } from 'vitest/config';

/**
 * The app imports its own modules as bare specifiers (`constants/layers`, `selectors/utils`),
 * which next resolves through `baseUrl: "."` in jsconfig.json. Vite needs to be told the same
 * thing, so every top-level source directory is aliased back to the repo root.
 */
const SOURCE_DIRS = ['components', 'constants', 'hooks', 'modules', 'selectors', 'services', 'utils'];

export default defineConfig({
  resolve: {
    alias: [
      { find: /^~\/(.*)$/, replacement: new URL('./$1', import.meta.url).pathname },
      ...SOURCE_DIRS.map((dir) => ({
        find: new RegExp(`^${dir}/(.*)$`),
        replacement: new URL(`./${dir}/$1`, import.meta.url).pathname
      }))
    ]
  },
  test: {
    include: ['**/__tests__/**/*.test.js'],
    exclude: ['node_modules/**', 'e2e/**', 'tools/**', '.next/**'],
    environment: 'node',
    // constants/layers.js reads these at module load, so they have to exist before any import
    env: {
      OTP_API: 'https://api.example.org',
      OTP_COUNTRIES: 'CMR,COG,CAF,GAB,COD'
    }
  }
});
