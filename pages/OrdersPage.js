export class OrdersPage {

    allOrderDetails;
    rows;
    ordersLink;
    page;

    constructor(page) {
        this.page = page;
        this.allOrderDetails = this.page.locator("tbody");
        this.rows = this.allOrderDetails.locator("tr");
        this.ordersLink = page.locator("[routerlink*='myorders']").last();
    }

    async getAllOrdersAndVerify(orderIds) {
        await this.rows.first().waitFor();
        let noOfOrders = await this.rows.count();
        for (let i = 0; i < noOfOrders; i++) {
            let orderNum = await this.rows.nth(i).locator("th").textContent();
            let isPresent = orderIds.includes(orderNum);
            if (isPresent) {
                await this.rows.nth(i).locator("text=View").click();
                await this.ordersLink.click();

                // Remove the matched order ID from the expected list so duplicates are not processed again
                const orderIndex = orderIds.indexOf(orderNum?.trim());
                if (orderIndex !== -1) orderIds.splice(orderIndex, 1);
                console.log("OrderId Removed ", orderNum);
            }
            if (orderIds.length === 0) break;
        }
        console.log("OrderIds ", orderIds);
    }
}