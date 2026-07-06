import {test, expect} from "@playwright/test";

const FOUR_EVENTS_RESPONSE = {
  data: [
    { id: 1, title: 'Tech Summit 2025', category: 'Conference', eventDate: '2025-06-01T10:00:00.000Z', venue: 'HICC', city: 'Hyderabad', price: '999', totalSeats: 200, availableSeats: 150, imageUrl: null, isStatic: false },
    { id: 2, title: 'Rock Night Live',  category: 'Concert',    eventDate: '2025-06-05T18:00:00.000Z', venue: 'Palace Grounds', city: 'Bangalore', price: '1500', totalSeats: 500, availableSeats: 300, imageUrl: null, isStatic: false },
    { id: 3, title: 'IPL Finals',       category: 'Sports',     eventDate: '2025-06-10T19:30:00.000Z', venue: 'Chinnaswamy', city: 'Bangalore', price: '2000', totalSeats: 800, availableSeats: 50, imageUrl: null, isStatic: false },
    { id: 4, title: 'UX Design Workshop', category: 'Workshop', eventDate: '2025-06-15T09:00:00.000Z', venue: 'WeWork', city: 'Mumbai', price: '500', totalSeats: 50, availableSeats: 20, imageUrl: null, isStatic: false },
  ],
  pagination: { page: 1, totalPages: 1, total: 4, limit: 12 },
};

const SIX_EVENTS_RESPONSE = {
  data: [
    { id: 1, title: 'Tech Summit 2025', category: 'Conference', eventDate: '2025-06-01T10:00:00.000Z', venue: 'HICC', city: 'Hyderabad', price: '999', totalSeats: 200, availableSeats: 150, imageUrl: null, isStatic: false },
    { id: 2, title: 'Rock Night Live',  category: 'Concert',    eventDate: '2025-06-05T18:00:00.000Z', venue: 'Palace Grounds', city: 'Bangalore', price: '1500', totalSeats: 500, availableSeats: 300, imageUrl: null, isStatic: false },
    { id: 3, title: 'IPL Finals',       category: 'Sports',     eventDate: '2025-06-10T19:30:00.000Z', venue: 'Chinnaswamy', city: 'Bangalore', price: '2000', totalSeats: 800, availableSeats: 50, imageUrl: null, isStatic: false },
    { id: 4, title: 'UX Design Workshop', category: 'Workshop', eventDate: '2025-06-15T09:00:00.000Z', venue: 'WeWork', city: 'Mumbai', price: '500', totalSeats: 50, availableSeats: 20, imageUrl: null, isStatic: false },
    { id: 5, title: 'Lollapalooza India', category: 'Festival', eventDate: '2025-06-20T12:00:00.000Z', venue: 'Mahalaxmi Racecourse', city: 'Mumbai', price: '3000', totalSeats: 5000, availableSeats: 2000, imageUrl: null, isStatic: false },
    { id: 6, title: 'AI & ML Expo',    category: 'Conference',  eventDate: '2025-06-25T10:00:00.000Z', venue: 'Bangalore International Exhibition Centre', city: 'Bangalore', price: '750', totalSeats: 300, availableSeats: 180, imageUrl: null, isStatic: false },
  ],
  pagination: { page: 1, totalPages: 1, total: 6, limit: 12 },
};


async function loginAndGoToEvents(page){
    await page.goto("https://eventhub.rahulshettyacademy.com");
    await page.getByLabel("Email").fill("dummy_email2@gmail.com");
    await page.getByLabel("Password").fill("Asdf1234@");
    await page.getByRole("button", {name:"Sign In"}).click();
    await page.getByTestId("nav-events").click();
}

test("Banner is visible, when 6 events are returned", async({page})=>{

    await page.route("**/api/events*", async route=>{
        await route.fulfill({
            status:200,
            contentType:'application/json',
            body: JSON.stringify(SIX_EVENTS_RESPONSE)
        });
    });
    await loginAndGoToEvents(page);

    let allCards =  page.getByTestId("event-card");
    await allCards.first().waitFor({state:'visible'});
    await expect(allCards.first()).toBeVisible();
    /* 
        Use Playwright's retryable selector assertion so the test waits until
        the expected number of cards is rendered instead of checking the count once.
    */
    await expect(allCards).toHaveCount(6);

    const bannerLoc =  page.getByText("sandbox holds up to")
    await expect(bannerLoc).toBeVisible();
    await expect(bannerLoc).toContainText("9 bookings");

})

test("Banner is NOT visible when 4 events are returned", async({page})=>{

    await page.route("**/api/events*", async route=>{
        await route.fulfill({
            status:200,
            contentType:'application/json',
            body: JSON.stringify(FOUR_EVENTS_RESPONSE)
        });
    });
    await loginAndGoToEvents(page);

    let allCards =  page.getByTestId("event-card");
    await allCards.first().waitFor({state:'visible'});
    await expect(allCards.first()).toBeVisible();
    await expect(allCards).toHaveCount(4);

    const bannerLoc =  page.getByText("sandbox holds up to");
    await expect(bannerLoc).not.toBeVisible();
})