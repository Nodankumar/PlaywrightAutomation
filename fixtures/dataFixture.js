// `pageFixtures.js` exports a custom `test` object with page object fixtures
// like loginPage, dashboardPage, cartPage, placeOrderPage, orderConfirmationPage,
// and ordersPage.
//
// Here we import that `test` as `base` and then extend it with `testData`.
// This creates a single chained fixture set that provides:
//  - all page object fixtures from pageFixtures
//  - parsed JSON data from e2edataPOM.json as `testData`
//
// The result is one reusable `test` import for specs that need both page objects
// and external test data.
import { test as base } from './pageFixtures';import e2eDataJson from "../testData/e2edataPOM.json";

// Extend Playwright's base `test` object with a custom `testData` fixture.
// This makes the parsed JSON available in tests as the `testData` fixture.
// `e2eDataJson` may already be a JavaScript object, or it may be a JSON string.
// We check the type so we only parse it when necessary.
export const test = base.extend({
    // `{} ` means this fixture does not need any other injected fixtures.
    // `use` is the callback that provides the fixture value to the test.
    testData: async ({}, use) => {
        // Parse JSON only if the import is a string.
        // If the import is already an object, use it directly.
        const data = typeof e2eDataJson === 'string' ? JSON.parse(e2eDataJson) : e2eDataJson;
        // Pass the parsed data into the test using `use`.
        await use(data);
    }
});