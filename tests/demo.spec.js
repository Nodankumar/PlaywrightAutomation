import { test, expect } from '@playwright/test';
import {getFormattedDate} from '../utils/CalenderUtil';
import {modifyPrice, getCellPosition, getSheet, writeToExcel} from '../utils/ExcelUtil';

/*
  test.describe.configure options:
    mode: 'default' - run tests normally in the file order, without forcing serial or parallel execution.
    mode: 'serial'  - run all tests in this describe block one after another, useful for shared state tests.
    mode: 'parallel' - allow tests in this describe block to run in parallel, if supported by the runner.
    retries: 2 - retry failed tests in this describe block up to 2 times before marking them as failed.
    timeout: 10000 - set a timeout of 10 seconds for each test in this describe block.
*/
test.describe.configure({ mode: 'default' })

test('verify Google homepage title', async ({ page }) => {
  await page.goto('https://www.google.com');

  console.log(await page.title());
  await expect(page).toHaveTitle('Google');
});

test("understanding auto-waiting", async ({ page }) => {

  await page.goto('https://www.hyrtutorials.com/p/waits-demo.html');
  await page.click('#btn1');

  //playwright will automatically wait for the textbox to be visible and type something
  await page.locator("(//h3/child::input[@id='txt1'])[1]").fill("Hello, Playwright!");

  //if we want to fill the specific textbox, we can use nth() method to specify the index
  await page.locator("(//h3/child::input[@id='txt1'])").nth(0).fill("Hello, nth!");

  //if we want to fill the first textbox, we can use first() method to specify the first element
  await page.locator("#txt1").first().fill("Hello, using first method!");

  /*"playwright does not wait for all elements to be visible, 
  it will return the text content of all matching elements, even if some of them are not visible yet"*/
  let allTexts = await page.locator("[itemprop='name']").allTextContents();
  console.log(allTexts);

  // Wait for all matching elements to be visible
  let guranteedAllTexts = await page.locator("[itemprop='name']").all().then(async (elements) => {
    for (const element of elements) {
      await element.waitFor({ state: 'visible' });
    }
    return await page.locator("[itemprop='name']").allTextContents();
  });
  console.log(guranteedAllTexts);

  //we can use last() method to specify the last element
  let text1 = await page.locator("[itemprop='name']").last().textContent();
  console.log(text1);


  //dropdown and radio buttons are also auto-waited by playwright, we can select the dropdown option and radio button 
  //without any explicit wait
  await page.goto('https://rahulshettyacademy.com/loginpagePractise/');
  const username = page.locator('#username');
  const password = page.locator('#password');
  const dropdown = page.locator("[data-style='btn-info']");

  username.fill("rahulshettyacademy");
  password.fill("Learning@830$3mK2");

  //select the dropdown option by label
  await dropdown.selectOption({ label: "Teacher" });

  //radio button is also auto-waited, we can click the radio button without any explicit wait
  const usrRb = page.locator('.checkmark').nth(1);
  await usrRb.click();
  //assert the radio button is checked
  await expect(usrRb).toBeChecked();

  //web based alert is also auto-waited, 
  //we can click the button to trigger the alert and then accept the alert without any explicit wait
  await page.locator('#okayBtn').click();

  //terms aand conditions isn't checked, we can assert it is not checked
  const tcChecked = await page.getByRole('checkbox', { 'name': 'terms' }).isChecked();
  expect(tcChecked).toBeFalsy();
  console.log("Terms and conditions checkbox is not checked: " + tcChecked);

  //assert the attributes of webelement.
  await expect(page.locator('[href *= "techsmarthire"]')).toHaveAttribute('class',"blinkingText");
  //pause the test to see the result
  //await page.pause();

});

test("switching to new tab/window using popup event", async ({ page }) => {

  await page.goto('https://rahulshettyacademy.com/loginpagePractise/');
  const techSmartHireLink = page.locator('//a[contains(text(), "TechSmartHire")]');

  // Listen for the popup event and get the new page object
  // Use evaluate() click here because normal Playwright click is blocked by pointer interception
  const [newPage] = await Promise.all([
    page.waitForEvent("popup"),
    techSmartHireLink.evaluate(el => el.click())
  ]);
  
  const nowLiveLocators = newPage.locator(".inline-flex .text-sm");
  console.log(await nowLiveLocators.textContent());
  await expect(nowLiveLocators).toContainText("Now Live");
  
});

test("switching to new tab/window using page event", async ({context }) => {
  const page = await context.newPage();
  await page.goto('https://rahulshettyacademy.com/loginpagePractise/');
  const techSmartHireLink = page.locator('//a[contains(text(), "TechSmartHire")]');

  // Listen for the page event and get the new page object
  const [newPage] = await Promise.all([
    context.waitForEvent('page'),
    techSmartHireLink.evaluate(el => el.click())
  ])

  const nowLiveLocators = newPage.locator(".inline-flex .text-sm");
  console.log(await nowLiveLocators.textContent());
  await expect(nowLiveLocators).toContainText("Now Live");
});


/*
  playwright provides several methods to locate elements on a web page, such as getByRole(), getByLabel(), getByPlaceholder(), getByText(), and getByTestId().
  These methods are designed to be more robust and reliable than traditional CSS or XPath selectors, as they rely on the semantic structure of the page rather than its visual layout.
  ->The getByLabel() method is used to locate form elements based on their associated label text. 
  It is particularly useful for locating input fields, checkboxes, and radio buttons that are associated with a label element.
  ->The getByPlaceholder() method is used to locate input fields based on their placeholder text.
  ->The getByText() method is used to locate elements based on their visible text content.
  ->The getByTestId() method is used to locate elements based on a custom data-testid attribute, 
  which can be added to elements for testing purposes.
  ->The getByRole() method is used to locate elements based on their ARIA role, which is a semantic attribute that describes the purpose of an element.
  What is an ARIA role? ARIA (Accessible Rich Internet Applications) roles are used to define the purpose and behavior of elements on a web page, 
  particularly for assistive technologies like screen readers.
  By using ARIA roles, developers can improve the accessibility of their web applications and 
  ensure that they are usable by a wider range of users, including those with disabilities.
  Examples of ARIA roles include button, checkbox, dialog, link, menu, and textbox.
*/

test("locating element using playwright special locators", async ({ page }) => {

  /*
    .locator(":visible") is used to locate the visible element on the page, 
    it will return the first visible element if there are multiple elements with the same locator.
    .locator(":has-text('text')") is used to locate the element that contains the specified text,
    it will return the first element that contains the specified text if there are multiple elements with the same locator.
    .locator(":has-text('text')").first() is used to locate the first element that contains the specified text,
    it will return the first element that contains the specified text if there are multiple elements with the same locator.
    .locator(":has-text('text')").nth(index) is used to locate the element at the specified index that contains the specified text,
    it will return the element at the specified index that contains the specified text if there are multiple elements with the same locator.
  */
  await page.goto('https://rahulshettyacademy.com/client/#/auth/register');
  /*
    for getByLabel() method to work, the label element must be associated with the form element 
    using the for attribute or by wrapping the form element inside the label element.
  */
  await page.getByLabel("First Name").fill('Grogu');
  // The label text on the page is "Phone Number", but the input's id is "userMobile"
  // and the label's for attribute is "userPhone". Since they don't match, getByLabel
  // cannot associate the label with the input element.
  await page.locator('#userMobile').fill('1234567890');
  await page.getByLabel("Male").first().check();
  await page.getByLabel("Confirm Password").fill("grogu@qw123");

  //for getByPlaceholder() method to work, the input element must have a placeholder attribute with the specified text.
  await page.getByPlaceholder("Passsword").first().fill("grogu@qw123");

  //for getByText() method to work, the element must have visible text content that matches the specified text.
  expect(await page.getByText("Register").nth(1).isVisible()).toBeTruthy();

  //for getByRole() method to work, the element must have a valid ARIA role attribute that matches the specified role.
  await page.getByRole("button", {name:'Register'}).click();

  /*
    getByRole(link, {name:'...'}) will not work for:
    <p class="login-wrapper-footer-text" style="cursor: pointer;" tabindex="0">Already have an account? 
    
    <a class="text-reset">Login here</a></p>
    
    Because the <a> tag lacks an href attribute. Without href, the <a> element doesn't have the implicit "link" ARIA role.
    Instead, it's treated as a generic element. To make it work:
    1. Add href attribute: <a href="/login" class="text-reset">Login here</a>
    2. Or use getByText(): page.getByText('Login here')
    3. Or use locator: page.locator('a.text-reset')
  */

    await page.goto("https://www.flipkart.com");
    //.press('Enter') is used to simulate the pressing of the Enter key after filling the search input field.
    await page.getByPlaceholder("Search for products, brands and more").first().fill("vivo t4 lite");
    await page.getByPlaceholder("Search for products, brands and more").first().press("Enter");

    /*
      .filter() method is used to filter the elements based on the specified criteria. 
      In this case, we are filtering the elements with class "k7wcnx" that contain the text "Vivo T4 Lite 5G".
      Diffrent from getByText(), filter() will return all the elements that match the criteria, while getByText() will return the first element that matches the criteria.
      .filter({diffrent options}) can be used to filter elements based on different criteria, such as hasText, has, and hasNot.
      Each option can be used to filter elements based on different criteria:
      - hasText: filters elements that contain the specified text.
      - has: filters elements that contain the specified element.
      - hasNot: filters elements that do not contain the specified element.
      - hasNotText: filters elements that do not contain the specified text.
      - visible: filters elements that are visible on the page.
      
    */
    await page.locator(".k7wcnx").filter({hasText:'Vivo T4 Lite 5G'}).first().click();
    //await page.pause();

});

test("Working with Calendar/Datepicker", async ({ page }) => {  
  await page.goto('https://rahulshettyacademy.com/seleniumPractise/#/offers');

  await page.locator(".react-date-picker__inputGroup").click();

  const date = getFormattedDate();
  console.log("date: ",date);
  const dateArr = date.split("/")

  const month = Number(dateArr[0]);
  const day = Number(dateArr[1]);;
  const year = Number(dateArr[2]);;

  //navigate to year selection
  await page.locator(".react-calendar__navigation__label").click();
  await page.locator(".react-calendar__navigation__label").click();

  let yearRange = await page.locator(".react-calendar__navigation__label").locator("span").textContent();
  let yArr = yearRange.split("–");
  let from = Number((yArr[0]).trim());
  let to = Number((yArr[1]).trim());
  
  //find and select the year, if the year is not in the current range, 
  //navigate to next or previous range until the year is found
  while(from<=year<=to){
    if(year<=to && year>=from){
      await page.locator("div .react-calendar__tile").filter({hasText:`${year}`}).click();
      break;
    }else if(year<from){
      await page.locator(".react-calendar__navigation__prev-button").click();
    }else{
      await page.locator(".react-calendar__navigation__next-button").click();
    }
    yearRange = await page.locator(".react-calendar__navigation__label").locator("span").textContent();
    yArr = yearRange.split("–");
    from = Number((yArr[0])?.trim());
    to = Number((yArr[1])?.trim());
  }

  //select the month
  await page.getByRole("button").locator("abbr").nth(month-1).click();
  //select the day
  /*
    Explanation:
      //abbr[text()='29'] → selects the <abbr> element with text 29.
        ancestor::button[...] → checks the parent <button> element that wraps the <abbr>.
        contains(@class,'react-calendar__month-view__days__day--neighboringMonth') → ensures we exclude days belonging to the neighboring month.
        not(...) → filters out those unwanted elements.
        This way, you’ll only get the <abbr> element for the 29th that belongs to the current month view.
  */
  await page.locator(`//abbr[text()=${day} and not(ancestor::button[contains(@class,'react-calendar__month-view__days__day--neighboringMonth')])]`).click();

  /*
    NOTE — For future reference (why we use this locator and tips):
    - We intentionally use a CSS locator `input[name="month"]` here instead of `getByRole()` because
      the accessible name resolution for `getByRole()` depends on visible labels or `aria-*` attributes.
      The HTML `name` attribute (e.g., `name="month"`) is not the same as the accessible name.
    - Inputs with `type="number"` expose the implicit ARIA role `spinbutton` (not `input`).
      If the app does not provide a visible <label>, `aria-label`, or `aria-labelledby` for the field,
      `page.getByRole('spinbutton', { name: '...' })` will not match reliably.
    - `inputValue()` returns the element's value as a string; keep assertions as strings (e.g., `String(month)`).
    - To make tests more robust and accessible, prefer adding one of the following on the app side:
      * a visible <label for="...">Month</label> paired with an `id` on the input,
      * an `aria-label="Month"`, or
      * a stable `data-testid` attribute, e.g. `data-testid="month-input"`.
    - If you later want to assert with built-in waiting, use `await expect(locator).toHaveValue(expected)`;
      it provides automatic waiting and clearer failure messages.
    - Summary: use `getByRole('spinbutton', { name: 'Month' })` only when the field has an accessible name;
      otherwise use a stable attribute-based locator like `input[name="month"]` or `data-testid`.
  */
  const aMonth = await page.locator("input[name='month']").inputValue();
  const  aDay = await page.locator("input[name='day']").inputValue();
  const aYear = await page.locator("input[name='year']").inputValue();

  expect(aMonth).toBe(String(month));
  expect(aDay).toBe(String(day));
  expect(aYear).toBe(String(year));
});

test("browser Navigation methods and assertions on hidden elements", async ({ page }) => {

  await page.goto('https://eventhub.rahulshettyacademy.com/login');
  await page.goto('https://rahulshettyacademy.com/AutomationPractice/');
  
  //navigate back to the previous page
  await page.goBack();
  //reload used to refresh the page, it will wait for the page to load before proceeding to the next step
  await page.reload();
  //navigate forward to the next page
  await page.goForward();

  //assert the element is visible and hidden after clicking the button
  await expect(page.locator("[id='displayed-text']")).toBeVisible();
  await page.getByRole("button", {name:'Hide'}).click();
  await expect(page.locator("[id='displayed-text']")).toBeHidden();
});

test("alert handling", async({page})=>{
  await page.goto("https://demoqa.com/alerts");
  /*
    page.on helps us to listen for the dialog event, which is triggered
    when an alert, confirm, or prompt dialog appears on the page.
    When the dialog event is triggered, the provided callback function is executed, allowing us to interact with the alert.
    it is important to note that the dialog event is emitted for each alert that appears on the page, 
    so if there are multiple alerts, the callback function will be executed multiple times.
    In the callback function, we can use the alert object to interact with the alert dialog.
    The alert object provides methods such as accept(), dismiss(), and message() to interact with the alert dialog.
    page.once can be used instead of page.on if we want to listen for the dialog event only once.
  */
  page.on("dialog", async(alert)=>{
    const alertType = alert.type();
    const alertMsg = alert.message();
    console.log("AlertType and Msg: ", alertType, alertMsg);
    if(alertType === "alert" || alertType === "prompt"){
      await alert.accept("Grogu123");
    }else if(alertType === "confirm"){
      await alert.dismiss();
    }
  
  })

  await page.click("#alertButton");
  await page.click("#timerAlertButton");
  await page.click("#confirmButton");
  await page.click("#promtButton");
});

test("mouse hover and frames", async({page})=>{

  /*
    
  diff bw .frameLocator() and .frame() in playwright:
    .frameLocator() returns a locator for the frame, which can be used to interact with elements inside the frame without switching the context.
    .frame() is used to switch the context to a specific frame, allowing you to interact with elements inside that frame directly.
    When you use .frame(), you need to switch back to the main context after interacting with the frame,
    while with .frameLocator(), you can interact with the frame without switching contexts.

    how to switchback to the main context after using .frame()?
    You can switch back to the main context by using the page.mainFrame() method. 
    For example, after interacting with a frame using .frame(), you can call page.mainFrame() to switch back to the main context:
    const frame = page.frame({ name: 'frameName' });
    // Interact with elements inside the frame
    // ...
    // Switch back to the main context
    page.mainFrame(); 

    how do decide which one to use?
    If you need to interact with multiple elements inside the same frame, it may be more efficient to use .frame() to switch to the frame context and interact with the elements directly. 
    However, if you only need to interact with a few elements inside the frame and want to avoid switching contexts, .frameLocator() can be a better choice as it allows you to interact with the frame without switching contexts.

  */

    page.on("dialog", async (alert)=>{
      await alert.accept("alert accepted");
    });

    await page.goto("https://vinothqaacademy.com/iframe/");
    await page.waitForLoadState("networkidle");
    const empTableFrame = await page.frameLocator("[name='employeetable']");
    empTableFrame.locator("#myTable>tbody tr td").nth(0).locator("input").first().check();

    const frame = await page.frame("popuppage");
    await frame.locator("[name='alertbox']").click();

    await page.mainFrame();

    const tutorialsLink = page.getByRole("link", { name: /tutorials/i }).first();
    await tutorialsLink.scrollIntoViewIfNeeded();
    await tutorialsLink.click({ force: true });
    await expect(page).toHaveURL("https://vinothqaacademy.com/tutorials/");
})

/*
  page.screenshot() is used to take a screenshot of the entire page, 
  while locator.screenshot() is used to take a screenshot of a specific element on the page.
  When you use page.screenshot(), it captures the entire visible area of the page, including all elements and content. 
  On the other hand, when you use locator.screenshot(), it captures only the specific element that the locator points to, along with its content and styling.
  The choice between the two methods depends on your testing needs. If you want to capture the overall appearance of the page, 
  including all elements, use page.screenshot(). If you want to focus on a specific element and capture its details, use locator.screenshot().
  screenshot({options}) can take several options to customize the screenshot, such as path, fullPage, clip, quality, and more.
*/
test("Screenshots demo", async({page})=>{
    await page.goto("https://www.facebook.com");
    await page.screenshot({path:`screenshots/fb${Date.now()}.png`});
    await page.locator("[src*='.webp']").screenshot({path:`screenshots/fbp${Date.now()}.png`});
})

/*
  toMatchSnapshot() is a Jest matcher that is used to compare a screenshot taken during a test with a reference image (snapshot) stored in the repository.
  When you run a test that includes toMatchSnapshot(), it will take a screenshot of the current state of the page and compare it to the reference image. 
  If the screenshot matches the reference image, the test will pass. If there are any differences between the two images, the test will fail,
   and you will be provided with a diff image that highlights the differences.
  This is particularly useful for visual regression testing, where you want to ensure that changes to your application do not unintentionally alter the visual appearance of your pages.
*/
// test("visual comparison demo", async({page})=>{
//     await page.goto("https://www.demo.web.toolsqa.com/");
//     expect(await page.locator(".banners").screenshot()).toMatchSnapshot("toolsSQABanners1781603864785.png");
// })



test("upload, download files and ExcelDemo", async ({page})=>{

  let newPrice = '6962';
  const filePath = "C:/Users/nodan/Downloads/downloadEdited.xlsx";
  const newPriceProductName = "Kivi"

  await page.goto("https://rahulshettyacademy.com/upload-download-test/");
  /*
    .waitForEvent('download') is used to wait for the download event to be triggered, which occurs when a file download starts.
    It returns a promise that resolves to a Download object when the download event is triggered.
    This allows us to handle file downloads in our tests, such as saving the downloaded file to a specific location or verifying its contents.
  */
  let downloadEventPromise =  page.waitForEvent("download");
  await page.getByRole("button", {name:'Download'}).click();
  const download = await downloadEventPromise;
  await download.saveAs(filePath);

  await modifyPrice(newPrice, newPriceProductName, filePath);

  /*
    .setInputFiles() is used to set the files for an <input type="file"> element, simulating a file upload.
    It takes a file path or an array of file paths as an argument and sets the specified files for the input element.
    This allows us to test file upload functionality in our tests, 
    such as verifying that the correct files are uploaded and processed by the application.
  */
  await page.locator("#fileinput").setInputFiles(filePath);
  await expect(page.locator(".Toastify__toast-body")).toBeVisible();

  
  /*
    Build a locator for the price cell of the row that contains the product name (newPriceProductName):
    - page.getByRole("row"): selects all row elements (rows in a table or list with role="row").
    - .filter({ hasText: newPriceProductName }): narrows those rows to the one that contains the product name string.
    - .locator("#cell-4-undefined"): targets the specific cell within that filtered row (here using the cell's id).
    The resulting locator (priceLocator) can be used to assert that the displayed price matches the expected newPrice.
  */
  const priceLocator = page.getByRole("row").filter({ hasText: newPriceProductName }).locator("#cell-4-undefined");
  await expect(priceLocator).toContainText(newPrice)
})