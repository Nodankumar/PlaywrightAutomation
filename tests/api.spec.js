import { test, expect } from '@playwright/test';
import { EcomAppUtil } from '../utils/EcomAppUtil';

const loginPayload = {
    userEmail: 'dummy_email@gmail.com',
    userPassword: 'Zxcv1234@'
};

test("add product", async ({ page, request }) => {

    const util = new EcomAppUtil(request, loginPayload);
    const token = await util.getToken();

    const productName = "ADIDAS ORIGINAL";
    const selectCountry = "india";

    //addInitScript uses to run javascript code before the page is loaded, here we are setting the token in local storage before the page is loaded
    await page.addInitScript((tkArg) => {
        window.localStorage.setItem("token", tkArg);
    }, token);


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

test("@sanity verify order", async ({ page, request }) => {

    const util = new EcomAppUtil(request, loginPayload);
    const token = await util.getToken();

    //addInitScript uses to run javascript code before the page is loaded, here we are setting the token in local storage before the page is loaded
    await page.addInitScript((tkArg) => {
        window.localStorage.setItem("token", tkArg);
    }, token);


    //create order using api
    const orderPayload = { orders: [{ country: "Chile", productOrderedId: "6960eae1c941646b7a8b3ed3" }] };

    const orderResponse = await util.createOrder(orderPayload);

    expect(await orderResponse.ok()).toBeTruthy();
    const orderJson = await orderResponse.json();
    const orderId = orderJson.orders[0];

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


test("verify no orders", async({page, request})=>{

    const util = new EcomAppUtil(request, loginPayload);
    const token = await util.getToken();

    //addInitScript uses to run javascript code before the page is loaded, here we are setting the token in local storage before the page is loaded
    await page.addInitScript((tkArg) => {
        window.localStorage.setItem("token", tkArg);
    }, token);

    /*
        intercept the api call and modify the response to return no orders for the customer, 
        here we are using route.fulfill to modify the response and return an empty array for orders and a message "No Orders"
        page.route is used to intercept the api call and route.fetch is used to get the original response from the server, 
        then we are modifying the response and returning it using route.fulfill
        route.abort can be used to abort the api call and return an error response.

    */
    await page.route("https://rahulshettyacademy.com/api/ecom/order/get-orders-for-customer/*", async route=>{
        const response = await route.fetch();
        const json = await response.json();
        json.data = [];
        json.message = "No Orders";
        await route.fulfill({
            response, json
        });

    })

    await page.goto("https://rahulshettyacademy.com/client/#/dashboard/dash");
    await page.click("[routerlink='/dashboard/myorders']");
    /*
        here we are waiting for the api call to complete and then verifying the message "You have No Orders to show at" 
        is visible on the page,
    */
    await page.waitForResponse("https://rahulshettyacademy.com/api/ecom/order/get-orders-for-customer/*")
    await expect(page.getByText('You have No Orders to show at')).toBeVisible();

})

test("intercept the req", async({page, request})=>{

    const util = new EcomAppUtil(request, loginPayload);
    const token = await util.getToken();

    //addInitScript uses to run javascript code before the page is loaded, here we are setting the token in local storage before the page is loaded
    await page.addInitScript((tkArg) => {
        window.localStorage.setItem("token", tkArg);
    }, token);

    await page.goto("https://rahulshettyacademy.com/client/#/dashboard/dash");
    await page.click("[routerlink='/dashboard/myorders']");

    /*
        route.continue is used to continue the request to the original url, here we are modifying the url to get the order details for a specific order id.
        only use when you want to modify the request url and not the response, if you want to modify the response use route.fulfill
                
    */
    await page.route("https://rahulshettyacademy.com/api/ecom/order/get-orders-details?id=*", async route=>{
        await route.continue({url:"https://rahulshettyacademy.com/api/ecom/order/get-orders-details?id=6a2fd71e17ee3e78badfdc5a"})
    })

    await page.locator("button:has-text('View')").first().click();
    await expect(page.locator("div .blink_me")).toBeVisible();
})

test("abort the req", async({page, request})=>{

    await page.on("requestfailed", request=>{
        console.log("Request failed with url ", request.url());
    });

    await page.route("**/*.css", route=>route.abort());

    await page.goto("https://www.facebook.com");
    await page.locator("[name=email]").fill("9063607175");
    await page.locator("[name=pass]").fill("value=7g69@.MRS@LkFs");
    await page.getByRole('button', {name:'Log in'}).click();


})