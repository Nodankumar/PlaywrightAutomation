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

  /* Retry policy: 2 retries when running on CI, 1 retry for local runs */
  retries: process.env.CI ? 2 : 1,

   /* Use a single worker on CI and two workers locally. */
  workers: process.env.CI ? 3 : 3,


  /* Run tests in files in parallel */
  // IMPORTANT: Set to true for faster test execution (2+ workers)
  // REQUIREMENT: Each test must have unique credentials in test data (e2edataPOM.json)
  // REASON: Parallel tests with same account cause session/state conflicts and timeouts
  // VERIFIED: 10/10 test runs passed with fullyParallel=true + separate test accounts
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  


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
 
  // Use line reporter for console output and allure-playwright for test reporting
  reporter: [["line"], ["allure-playwright"]],


  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    // baseURL: 'http://localhost:3000',

    actionTimeout: 15_000,
    navigationTimeout: 30_000,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer 
      Available options to record a trace:
      'on-first-retry' - Record a trace only when retrying a test for the first time.
      'on-all-retries' - Record traces for all test retries.
      'off' - Do not record a trace.
      'on' - Record a trace for each test. (not recommended as it's performance heavy)
      'retain-on-failure' - Record a trace for each test, but remove it from successful test runs.
      'retain-on-first-failure': Record a trace only for the first run of a test (not for retries), and keep it only if that run failed.
      'retain-on-failure-and-retries': Record a trace for every run, and keep it for any run that failed or that is a retry.
    */
    trace: 'retain-on-failure-and-retries',

    //screenshot on failure and attach to report 
    /*  'off': Do not capture screenshots.
        'on': Capture screenshot after each test.
        'only-on-failure': Capture screenshot after each test failure.
        'on-first-failure': Capture screenshot after each test's first failure.
    */
    screenshot: 'only-on-failure',

    /*
      'off': Do not record video.
      'on': Record and keep a video for every run.
      'on-first-retry': Record and keep a video only for the first retry of a test.
      'on-all-retries': Record and keep a video for every retry.
      'retain-on-failure': Record a video for every run, but keep it only for runs that failed. A failed run's video is kept even when a later retry passes.
      'retain-on-first-failure': Record a video only for the first run of a test (not for retries), and keep it only if that run failed.
      'retain-on-failure-and-retries': Record a video for every run, and keep it for any run that failed or that is a retry.
    */
    video:'retain-on-failure'
  },

  /*
    projects define different browsers and devices to run tests against. 
    Each project can have its own configuration, allowing you to test across multiple environments.
    You can also use the `devices` object from Playwright to easily emulate popular devices like iPhones, iPads, and Android phones.
  */
  projects: [
    {
      name: "chrome",
      use: {
        browserName: "chromium",
        headless: !!process.env.CI,
        launchOptions: {
          args: ["--disable-dev-shm-usage"]
        },
        /*
          ignoreHTTPSErrors: true allows the browser to bypass SSL certificate errors, 
          which is useful for testing in environments with self-signed certificates or other SSL issues.
        */
        ignoreHTTPSErrors: true,
        /*
          viewport sets the size of the browser window for the tests. 
          This can be important for testing responsive designs and ensuring that elements are displayed correctly at different screen sizes.
        */
        viewport: { height: 720, width: 1080 }
      }
    },
    {
      name: "Android Mobile Emulation",
      use: {
        browserName: "chromium",
        headless: false,
        ignoreHTTPSErrors: true,
        /*
          ...devices['Galaxy S24'] uses the predefined device configuration for the Galaxy S24 Android device.
          This includes settings like viewport size, user agent, and device scale factor, allowing you to test how your application behaves on that specific mobile device.

        */
        ...devices['Galaxy S24']
      }
    },
    {
      name: "iphone Emulation",
      use: {
        browserName: "webkit",
        headless: false,
        ignoreHTTPSErrors: true,
        ...devices["iPhone 14 Pro"]
      }
    },
    {
      name: "safari",
      use: {
        browserName: "webkit",
        headless: true,
        ignoreHTTPSErrors: true,
        /*
          permissions: an array of permission strings to grant to the browser context.
          Common values include:
            - 'geolocation'
            - 'notifications'
            - 'microphone'
            - 'camera'
            - 'clipboard-read'
            - 'clipboard-write'
            - 'persistent-storage'
            - 'midi'
            - 'midi-sysex'
            - 'background-sync'
            - 'ambient-light-sensor'
            - 'accelerometer'
            - 'gyroscope'
            - 'magnetometer'
          Use only the permissions your tests require to minimize side effects.
        */
        permissions: ['geolocation', 'notifications'],
      }
    }
  ]


});

