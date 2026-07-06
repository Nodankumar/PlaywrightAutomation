// ==============================================================================
// FIXTURE SETUP EXPLANATION
// ==============================================================================
// Import 'test' from the custom fixture file (not from @playwright/test)
// This 'test' is an EXTENDED version of Playwright's base test object.
// 
// Why? The fixture extends the base test with a custom 'testData' fixture that:
//   1. Reads the JSON file (e2edataPOM.json)
//   2. Provides the parsed data to tests as a fixture parameter
//   3. Is backward compatible - tests that don't use testData still work fine
//
// Both approaches work with this extended test:
//   - Tests without testData parameter use the imported JSON directly (e2eDataObj)
//   - Tests with testData parameter receive data from the fixture
// ==============================================================================

import { expect } from '@playwright/test';
import { test } from '../fixtures/dataFixture';
import { generateLuhnNumber, generateCVV, generateExpiry, generateCardName } from '../utils/cardUtils';

import e2eData from '../testData/e2edataPOM.json';
const e2eDataObj = JSON.parse(JSON.stringify(e2eData));

test.describe('E2E Flow for E-commerce', () => {

    // IMPORTANT: Closure Handling & Parallel Test Execution
    // 
    // Issue 1: Closure Problem with for...of
    // ----------------------------------------
    // Using for...of loop causes all test callbacks to reference the same object,
    // specifically the LAST object value after the loop completes. This happens because:
    // - Tests register immediately when code is parsed
    // - Tests execute later asynchronously
    // - All callbacks reference the same object variable
    // SOLUTION: Use forEach() which creates a new function scope per iteration,
    // ensuring each test captures its own correct object value.
    //
    // Issue 2: Parallel Execution Requires Separate Test Accounts
    // -----------------------------------------------------------
    // When running tests in parallel (2+ workers) with the SAME account credentials:
    // - Both tests log in with same account → share same server session
    // - Both tests modify same cart state simultaneously → data race condition
    // - One test's cart updates overwrite the other's → tests fail with timeout
    // - Payment/order processing conflicts at database level → inconsistent state
    // SOLUTION: Each test data object MUST have unique credentials (different emails).
    // This ensures isolated sessions with no interference. Verify in e2edataPOM.json
    // that each test has a unique 'username' field.
    //
    // Test Results: 100% pass rate (10/10 runs) with forEach() + separate accounts

    e2eDataObj.forEach((obj) => {
        test(`should allow a user to complete a purchase : ${obj.productName}`, async ({ page, loginPage, dashboardPage, placeOrderPage, cartPage, ordersPage, orderConfirmationPage}) => {

            const username = obj.username;
            const password = obj.password;
            const productName = obj.productName;
            const selectCountry = obj.selectCountry;

            // Step 1: Navigate to the homepage
            //const loginPage = new LoginPage(page);
            await loginPage.gotoLoginPage();
            await expect(page).toHaveTitle("Let's Shop");

            // Step 2: Log in with valid credentials
            await loginPage.doLogin(username, password);

            //step 3: Add product to cart
            //const dashboardPage = new DashboardPage(page);
            await dashboardPage.addProductToCart(productName);

            //navigate to cart page and verify product added in the cart
            await dashboardPage.clickOnCart();

            //const cartPage = new CartPage(page);
            let isItemAdded = await cartPage.isAddedProductVisible(productName);
            await expect(isItemAdded).toBeTruthy();

            //proceed to checkoutPage
            await cartPage.clickCheckoutBtn();

            //generate card details using utility functions
            const creditCardNumber = generateLuhnNumber(16);
            const cvv = generateCVV(3);
            const expiry = generateExpiry();
            const cardName = generateCardName();
            console.log('Generated Card:', creditCardNumber);
            console.log('Generated CVV:', cvv);
            console.log("Generated Expiry: ", expiry);
            console.log("Generated Card Name: ", cardName);

            //fill card details
            //const placeOrderPage = new PlaceOrderPage(page);

            const expiryArr = expiry.split("/");
            await placeOrderPage.enterCardDetails(creditCardNumber, expiryArr[0], expiryArr[1], cvv, cardName)

            //apply coupon code and verify discount
            await placeOrderPage.applyCoupon("rahulshettyacademy");
            const couponAppliedText = await placeOrderPage.couponAppliedText();
            await expect(couponAppliedText).toContainText("Coupon Applied");

            //verify email
            const shiipingEmail = await placeOrderPage.getShippingEmail();
            expect(shiipingEmail).toContain(username);

            //select country and verify dropdown options
            await placeOrderPage.selectCountry(selectCountry);


            //place Order
            await placeOrderPage.clickPlaceOrderBtn();

            //const orderConfirmationPage = new OrderConfirmationPage(page);

            expect(await orderConfirmationPage.getOrderGreetings()).toHaveText(" Thankyou for the order. ");


            let orderIds = await orderConfirmationPage.getPlacedOrderIds();

            //Naviagate to orders history and verify the order and view that order
            await orderConfirmationPage.clickOrdersHistory()

            //get All orderIds in the table
            //const ordersPage = new OrdersPage(page);
            await ordersPage.getAllOrdersAndVerify(orderIds);
        });
    });

    // ==============================================================================
    // TEST WITH FIXTURE APPROACH
    // ==============================================================================
    // This test demonstrates accessing data via the 'testData' fixture
    // 
    // Key differences from forEach tests:
    //   1. The fixture parameter is passed in the test function: { page, testData }
    //   2. testData is an ARRAY of objects from e2edataPOM.json
    //   3. We access the FIRST index [0] to get the first test data object
    //   4. This runs as a single test (not multiple tests from a loop)
    //
    // Advantages of using fixtures:
    //   - Cleaner separation of concerns
    //   - Better for single test data scenarios
    //   - More explicit dependency injection pattern
    // ==============================================================================

    test(`should allow a user to complete a purchase using testData fixture`, async ({ page, testData, loginPage, dashboardPage, placeOrderPage, cartPage, ordersPage, orderConfirmationPage }) => {

        // Access only the first index of the testData array from the fixture
        const username = testData[0].username;
        const password = testData[0].password;
        const productName = testData[0].productName;
        const selectCountry = testData[0].selectCountry;

        // Step 1: Navigate to the homepage
        //const loginPage = new LoginPage(page);
        await loginPage.gotoLoginPage();
        await expect(page).toHaveTitle("Let's Shop");

        // Step 2: Log in with valid credentials
        await loginPage.doLogin(username, password);

        //step 3: Add product to cart
        //const dashboardPage = new DashboardPage(page);
        await dashboardPage.addProductToCart(productName);

        //navigate to cart page and verify product added in the cart
        await dashboardPage.clickOnCart();

        //const cartPage = new CartPage(page);
        let isItemAdded = await cartPage.isAddedProductVisible(productName);
        await expect(isItemAdded).toBeTruthy();

        //proceed to checkoutPage
        await cartPage.clickCheckoutBtn();

        //generate card details using utility functions
        const creditCardNumber = generateLuhnNumber(16);
        const cvv = generateCVV(3);
        const expiry = generateExpiry();
        const cardName = generateCardName();
        console.log('Generated Card:', creditCardNumber);
        console.log('Generated CVV:', cvv);
        console.log("Generated Expiry: ", expiry);
        console.log("Generated Card Name: ", cardName);

        //fill card details
        //const placeOrderPage = new PlaceOrderPage(page);

        const expiryArr = expiry.split("/");
        await placeOrderPage.enterCardDetails(creditCardNumber, expiryArr[0], expiryArr[1], cvv, cardName)

        //apply coupon code and verify discount
        await placeOrderPage.applyCoupon("rahulshettyacademy");
        const couponAppliedText = await placeOrderPage.couponAppliedText();
        await expect(couponAppliedText).toContainText("Coupon Applied");

        //verify email
        const shiipingEmail = await placeOrderPage.getShippingEmail();
        expect(shiipingEmail).toContain(username);

        //select country and verify dropdown options
        await placeOrderPage.selectCountry(selectCountry);

        //place Order
        await placeOrderPage.clickPlaceOrderBtn();

        //const orderConfirmationPage = new OrderConfirmationPage(page);

        expect(await orderConfirmationPage.getOrderGreetings()).toHaveText(" Thankyou for the order. ");

        let orderIds = await orderConfirmationPage.getPlacedOrderIds();

        //Naviagate to orders history and verify the order and view that order
        await orderConfirmationPage.clickOrdersHistory()

        //get All orderIds in the table
        //const ordersPage = new OrdersPage(page);
        await ordersPage.getAllOrdersAndVerify(orderIds);
    });

});