import { test, expect } from '@playwright/test';

const BASE_URL = 'https://eventhub.rahulshettyacademy.com';

const yahooUserEmail = "dummy_email2@gmail.com";
const yahooUserPwd = "Asdf1234@";

const GMAIL_USER = {
    username: "gmail_user02@gmail.com",
    password: "Asdf1234@"
}

test("Cross-User booking access denied", async ({ page, request }) => {

    //Step 1 — Login as Yahoo user via API
    const loginRes = await request.post("https://api.eventhub.rahulshettyacademy.com/api/auth/login", {
        data: {
            "email": yahooUserEmail,
            "password": yahooUserPwd
        },
        headers: {
            "Content-Type": "application/json"
        }
    });

    await expect(loginRes).toBeOK();
    const body = await loginRes.json();
    const token = body.token;
    expect(token).toBeTruthy();
    console.log("Token: ", token);

    //Step 2 — Fetch events via API to get a valid event ID
    const eventsRes = await request.get("https://api.eventhub.rahulshettyacademy.com/api/events", {
        headers: {
            Authorization: "Bearer " + token
        }
    })

    const allEventsBody = await eventsRes.json();
    const eventId = allEventsBody.data[0].id;
    console.log("EventId: ", eventId);

    //Step 3 — Create a booking via API as Yahoo user
    const eventBookingRes = await request.post("https://api.eventhub.rahulshettyacademy.com/api/bookings", {
        data: {
            "eventId": eventId,
            "customerName": "Dummy Yahoo User",
            "customerEmail": yahooUserEmail,
            "customerPhone": "+91-9876543210",
            "quantity": 1
        },
        headers: {
            Authorization: "Bearer " + token
        }
    })

    await expect(eventBookingRes).toBeOK();
    const ebrBody = await eventBookingRes.json();
    const yahooBookingId = ebrBody.data.id;
    console.log("yahooBookingId: ", yahooBookingId);

    //Step 4 — Login as Gmail user via browser UI
    await loginAs(page, GMAIL_USER)

    //Step 5 — Navigate to Yahoo's booking URL as Gmail user
    await page.route("**/api/bookings/*", async route =>
        route.continue({ url: `https://api.eventhub.rahulshettyacademy.com/api/bookings/${yahooBookingId}` })
    )

    await page.getByTestId("nav-bookings").click();
    await page.locator("button:has-text('View Details')").first().click();
    await page.waitForNavigation({ waitUntil: "networkidle" });

    //Step 6 — Validate Access Denied
    await expect(page.getByText("Access Denied")).toBeVisible();
    await expect(page.getByText("You are not authorized to view this booking")).toBeVisible();

    //Step 7 — clear bookings
    const deleteBookings  = await request.delete("https://api.eventhub.rahulshettyacademy.com/api/bookings", {
        headers: {
            Authorization: "Bearer " + token
        }
    })
    await expect(deleteBookings).toBeOK();
})

async function loginAs(page, GMAIL_USER) {

    await page.goto(BASE_URL);
    await page.getByLabel("Email").fill(GMAIL_USER.username);
    await page.getByLabel("Password").fill(GMAIL_USER.password);
    await page.getByRole("button", { name: 'Sign In' }).click();

}