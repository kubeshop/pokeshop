import { defineConfig } from 'cypress';
import { config } from 'dotenv';

config();

module.exports = defineConfig({
  chromeWebSecurity: false,
  e2e: {
    baseUrl: process.env.POKESHOP_DEMO_URL || 'http://localhost:3000',
    env: {
      TRACETEST_API_TOKEN: process.env.TRACETEST_API_TOKEN,
      TRACETEST_SERVER_URL: process.env.TRACETEST_SERVER_URL || 'https://app.tracetest.io',
      TRACETEST_ENVIRONMENT_ID: process.env.TRACETEST_ENVIRONMENT_ID
    },
    setupNodeEvents() {
      // implement node event listeners here
    },
  },
});
