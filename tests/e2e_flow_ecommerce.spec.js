import {test, expect} from '@playwright/test';
import { generateLuhnNumber, generateCVV, generateExpiry, generateCardName } from '../utils/cardUtils';

test.describe('E2E Flow for E-commerce', () => {

  test('should allow a user to complete a purchase', async ({page}) => {

    const username = "dummy_email@gmail.com";
    const password = "Zxcv1234@";
    const productName = "ADIDAS ORIGINAL";
    const selectCountry = "india";

    // Step 1: Navigate to the homepage
    await page.goto('https://rahulshettyacademy.com/client/#/auth/login');
    await expect(page).toHaveTitle("Let's Shop");

    // Step 2: Log in with valid credentials
    await page.getByPlaceholder("email@example.com").fill(username);
    await page.getByPlaceholder("enter your passsword").fill(password);
    await page.getByRole("button", {name:"Login"}).click();

    //step 3: Add product to cart
    const allProducts = page.locator(".card .card-body");
    //wait until produts are vissible on the page
    await allProducts.first().waitFor();
    //iterate over the products and add matching product
    for(let i=0; i < await allProducts.count();i++){
        const pName = await allProducts.nth(i).locator("b").textContent();
        // console.log("pName ", pName);
        if(pName.trim() === productName){
            await allProducts.nth(i).locator("text=' Add To Cart'").click();
            break;
        }
    }

    //await page.pause();

    //navigate to cart page and verify product added in the cart
    await page.locator("[routerlink*='cart']").click();
    let cartItems = page.locator(".cartWrap .items");
    //wait for cart items to be visible
    await cartItems.first().waitFor();
    let noOfItemsInCart = await cartItems.count();
    console.log("NoOfItemsInCart: ", noOfItemsInCart);
    let isItemAdded = await cartItems.locator(`text=${productName}`).isVisible();
    console.log("isItemAdded: ", await cartItems.locator(`text=${productName}`).textContent());
    await expect(cartItems.locator(`text=${productName}`)).toHaveText(productName);


    //proceed to checkoutPage
    await page.locator(".totalRow [type='button']").click();

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
    await page.locator("//div[normalize-space(text()) = 'Credit Card Number']/following-sibling::input").fill(creditCardNumber);
    await page.locator("//div[text()='CVV Code ']/following-sibling::input").fill(cvv);
    
    const expiryArr = expiry.split("/");
    const monthLoc = await page.locator(".field .ddl").first();
    await monthLoc.selectOption(expiryArr[0]);
    const dayLoc = await page.locator(".field .ddl").last();
    await dayLoc.selectOption(expiryArr[1]);

    await page.locator("//div[normalize-space(text())='Name on Card']/following-sibling::input").fill(cardName);

    //apply coupon code and verify discount

    await page.locator("[name='coupon']").fill('rahulshettyacademy');
    await page.locator(".field .mt-1").last().click();
    await expect(page.locator(".field .mt-1").first()).toContainText("Coupon Applied")

    //verify email
    console.log("email associated with the order: ",await page.locator(".user__name>input").inputValue());
    //toHaveValue is used to verify the value of input field, 
    //it will wait until the value is updated in the input field and then verify it with the expected value
    expect(await page.locator(".user__name>input")).toHaveValue(username);

    //select country and verify dropdown options
    //pressSquentially is used to type the text in the input field one by one with a delay, 
    //it will also trigger the dropdown options based on the input text
    await page.getByPlaceholder("Select Country").pressSequentially("ind", {delay:100});
    let suggestedDD = await page.locator(".ta-results span");
    await suggestedDD.first().waitFor();

    for(let i=0;i<await suggestedDD.count();i++){
        const countryLoc = suggestedDD.nth(i);
        let countryText = await countryLoc.textContent();
        console.log("Country from dd: ", countryText);
        if(countryText.trim().toLowerCase()===selectCountry){
            await countryLoc.click();
            break;
        }
    }

    //place Order
    await page.locator("text=Place Order").click();
    expect(page.locator(".hero-primary")).toHaveText(" Thankyou for the order. ");
    let orderIdLocs = page.locator("//label[@routerlink='/dashboard/myorders']/parent::td/parent::tr/following-sibling::tr/descendant::label");
    await orderIdLocs.first().waitFor();    
    let orderIds = [];
    for(let i=0; i<await orderIdLocs.count();i++){
        //playwright does not allow to directly get the text content of the locator which has multiple elements,
        //so we need to iterate over the elements and get the text content one by one
        //and auto-waiting isnt supported for textContent method, so we need to wait for the element to be visible before getting the text content
        let orderId = await orderIdLocs.nth(i).textContent();
        orderIds.push(((orderId.split("|"))[1]).trim());
    }
    console.log("orderIds ", orderIds);

    //Naviagate to orders history and verify the order and view that order
    await page.locator("[routerlink*='myorders']").first().click();
    //get All orderIds in the table
    let allOrderDetails = page.locator("tbody");
    let rows = allOrderDetails.locator("tr");
    await rows.first().waitFor();
    let noOfOrders = await rows.count();
        for(let i=0;i< noOfOrders; i++){
        let orderNum = await rows.nth(i).locator("th").textContent();
        let isPresent = orderIds.includes(orderNum);
        if(isPresent){
            rows.nth(i).locator("text=View").click();
            await expect(page.locator("div>.col-text")).toHaveText(orderNum);
            await page.locator("[routerlink*='myorders']").last().click();

            // Remove the matched order ID from the expected list so duplicates are not processed again
            const orderIndex = orderIds.indexOf(orderNum?.trim());
            if (orderIndex !== -1) orderIds.splice(orderIndex, 1);
            console.log("OrderId Removed ", orderNum);
        }
        if(orderIds.length===0) break;
    }
    console.log("OrderIds ", orderIds);
    
    });

  });