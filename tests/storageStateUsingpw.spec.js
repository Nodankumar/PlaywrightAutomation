import { test, expect} from '@playwright/test';
import { EcomAppUtil } from '../utils/EcomAppUtil';

const loginPayload = {
    userEmail: 'dummy_email@gmail.com',
    userPassword: 'Zxcv1234@'
};


test.beforeAll("Maintain state", async ({browser}) => {

    const context = await browser.newContext();
    const page = await context.newPage();

    const username = "dummy_email@gmail.com";
    const password = "Zxcv1234@";

    // Step 1: Navigate to the homepage
    await page.goto('https://rahulshettyacademy.com/client/#/auth/login');
    await expect(page).toHaveTitle("Let's Shop");

    // Step 2: Log in with valid credentials
    await page.getByPlaceholder("email@example.com").fill(username);
    await page.getByPlaceholder("enter your passsword").fill(password);
    await page.getByRole("button", { name: "Login" }).click();
    /*Step 3: Wait for the page to load after login
      make sures storage state is saved after the page is fully loaded and all network requests are completed,
      ensuring that the storage state reflects the logged-in status accurately.
    */
    await page.waitForLoadState("networkidle");

    /*
        .storageState() method is used to save the current state of the browser context, 
        including cookies, local storage, and session storage, to a file. 
        This allows you to maintain the logged-in state across different test runs or sessions. 
        By saving the storage state after logging in, you can reuse it in subsequent tests to avoid having to log in again, 
        thus improving test efficiency and reducing execution time.
    */
    await context.storageState({ path: "storageState.json" });
    //await page.context().storageState({path:"storageState.json"});
    await context.close();
})


test("add product", async ({ request, browser}) => {


    const productName = "ADIDAS ORIGINAL";
    const selectCountry = "india";

    /*
       storageState option is used to specify the path to the storage state file.
       By providing the storage state file, the new browser context will be initialized with the same cookies, 
       local storage, and session storage as the previous context where the user logged in. 
       This allows you to maintain the logged-in state and access authenticated pages without having to log in again in this test.
    */
    const context = await browser.newContext({storageState:"storageState.json"});
    const page = await context.newPage();


    //wait until the page is loaded and then navigate to the dashboard page, here we are using networkidle to wait until all the network requests are completed before proceeding further
    await page.goto("https://rahulshettyacademy.com/client/#/dashboard/dash", { waitUntil: 'networkidle' });

    //step 3: Add product to cart
    const allProducts = page.locator(".card .card-body");
    //wait until produts are vissible on the page
    await allProducts.first().waitFor();
    //iterate over the products and add matching product
    for (let i = 0; i < await allProducts.count(); i++) {
        const pName = await allProducts.nth(i).locator("b").textContent();
        // console.log("pName ", pName);
        if (pName.trim() === productName) {
            await allProducts.nth(i).locator("text=' Add To Cart'").click();
            break;
        }
    }

});

test("verify order", async ({request, browser}) => {

    const util = new EcomAppUtil(request, loginPayload);

    //create order using api
    const orderPayload = { orders: [{ country: "Chile", productOrderedId: "6960eae1c941646b7a8b3ed3" }] };

    const orderResponse = await util.createOrder(orderPayload);

    expect(await orderResponse.ok()).toBeTruthy();
    const orderJson = await orderResponse.json();
    const orderId = orderJson.orders[0];

    const context = await browser.newContext({storageState:"storageState.json"});
    const page = await context.newPage();

    await page.goto("https://rahulshettyacademy.com/client/#/dashboard/dash");
    await page.locator("[routerlink='/dashboard/myorders']").click();

    //get All orderIds in the table
    let allOrderDetails = page.locator("tbody");
    let rows = allOrderDetails.locator("tr");
    await rows.first().waitFor();
    let noOfOrders = await rows.count();
    for (let i = 0; i < noOfOrders; i++) {
        let orderNum = await rows.nth(i).locator("th").textContent();
        if (orderNum === orderId) {
            rows.nth(i).locator("text=View").click();
            await expect(page.locator("div>.col-text")).toHaveText(orderNum);
            break;
        }
    }

})
