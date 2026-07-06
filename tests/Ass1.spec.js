import {test, expect} from '@playwright/test';


test('get first product title', async ({page}) => {

    const email = page.getByPlaceholder('email@example.com');

    const emailValue = `dummy_email_${Date.now()}@gmail.com`;
    const passwordValue = 'Zxcv1234@';

    // Navigate to the registration page
    await page.goto('https://rahulshettyacademy.com/client/#/auth/register');

    // Fill in the registration form
    await page.getByPlaceholder('First Name').fill('Nodankumar');
    await page.getByPlaceholder('Last Name').fill('Reddy');
    await email.fill(emailValue);
    await page.getByPlaceholder("enter your number").fill('1234567890');
    await page.getByPlaceholder("Passsword").first().fill(passwordValue);
    await page.getByPlaceholder("Confirm Passsword").last().fill(passwordValue);
    await page.locator('[type="checkbox"]').check();
    await page.getByRole('button', {name: 'Register'}).click();

    // Login with the registered credentials
    await page.getByRole('button', {name: 'Login'}).click();
    await email.fill(emailValue);
    await page.getByPlaceholder("enter your passsword").fill(passwordValue);
    await page.getByRole('button', {name: 'Login'}).click();

    //waitForLoadState('networkidle') is used to wait until there are no network connections for at least 500 ms.
    //This is useful to ensure that all products have been loaded before trying to access them.
    await page.waitForLoadState('networkidle');
    const allProducts1 = await page.locator("div h5 > b").allTextContents();
    console.log(allProducts1);

    // Wait for the products to load and get the titles of all products
    await page.locator("div h5 > b").first().waitFor({state: 'visible'});
    const allProducts = await page.locator("div h5 > b").allTextContents();
    console.log(allProducts);

    // Wait for the products to load and get the title of the first product
    const firstProductTitle = await page.locator("div h5 > b").first().textContent();
    console.log(firstProductTitle);



});