import { readFileSync } from 'node:fs';

import { defineConfig } from 'vitest/config';

// shared with the e2e build so both runs count the same files and can be merged
const nyc = JSON.parse(readFileSync(new URL('./.nycrc.json', import.meta.url), 'utf8'));

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
    },
    coverage: {
      provider: 'istanbul',
      exclude: nyc.exclude,
      reportsDirectory: 'coverage/unit',
      reporter: ['text-summary', 'html', 'json']
    }
  }
});
