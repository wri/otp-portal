import { defineConfig } from 'vitest/config';

import baseConfig from './vitest.config.mjs';

// Live network checks against GFW, kept out of `yarn test`. GFW's data API has multi-second
// tail latency, hence the generous timeouts and a retry.
export default defineConfig({
  ...baseConfig,
  test: {
    ...baseConfig.test,
    include: ['**/__smoke__/**/*.smoke.js'],
    testTimeout: 30000,
    hookTimeout: 30000,
    retry: 1
  }
});
