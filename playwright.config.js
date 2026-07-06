// @ts-check
import { defineConfig, devices } from '@playwright/test';
/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',

  //Global timeout for each test
  timeout: 30 * 1000,

  expect: {
    // Maximum time expect() should wait for the condition to be met.
    timeout: 5000,
  },

  /* Run tests in files in parallel */
  // IMPORTANT: Set to true for faster test execution (2+ workers)
  // REQUIREMENT: Each test must have unique credentials in test data (e2edataPOM.json)
  // REASON: Parallel tests with same account cause session/state conflicts and timeouts
  // VERIFIED: 10/10 test runs passed with fullyParallel=true + separate test accounts
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 1,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters
    different reporter options are 'line', 'list', 'dot', 'json', 'html', 'allure-playwright', 'junit', 'markdown', 'min', 'spec', 'tap'
      
      | **Reporter** | **Description** | **Best Use Case** |
      | ---          | ---             | ---               |
      | **list**     | Default locally. Prints each test line by line. | Clear terminal output for local runs. |
      | **dot**      | Default on CI. Prints a dot per test. | Concise CI logs. |
      | **line**     | Shows one line per test with result. | Minimal but readable output. |
      | **json**     | Outputs structured JSON file. | Machine‑readable results for integrations. |
      | **junit**    | Produces JUnit XML format. | CI/CD tools like Jenkins, Azure DevOps. |
      | **html**     | Generates interactive HTML report with screenshots, videos, traces. | Debugging and stakeholder‑friendly reports. |
      | **null**     | Disables reporting. | When you don’t want any output. |
  */
  reporter: 'html',



  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer 
      different trace options are 'on', 'off', 'on-first-retry', 'on-all-retries'
      on-first-retry will collect trace only for the first retry of a failed test, which can help in debugging without generating excessive trace files for every test run.
    */
    trace: 'retain-on-failure-and-retries',

    //set the default browser to chromium
    browserName:'chromium',

    //run the tests in headed mode
    headless: false,

    //set timeout for each action to 30 seconds
    timeout: 30 * 1000,

    expect: {
      // Maximum time expect() should wait for the condition to be met.
      timeout: 5000,
    },

    //screenshot on failure and attach to report 
    /*  different screenshot options are 'on', 'off', 'only-on-failure', 'on-first-retry'
        'only-on-failure' will capture screenshots only when a test fails, which can help in debugging while avoiding unnecessary screenshots for passing tests.
    */
    screenshot: 'only-on-failure',
  },

  
});

