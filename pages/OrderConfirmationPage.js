export class OrderConfirmationPage{

    orderIdLocs;
    OrderHistoryLink;
    orderGreetings;
    page;
     
    constructor(page){
        this.page = page;
        this.orderIdLocs = this.page.locator("//label[@routerlink='/dashboard/myorders']/parent::td/parent::tr/following-sibling::tr/descendant::label");
        this.OrderHistoryLink = this.page.locator("[routerlink*='myorders']").last();
        this.orderGreetings = this.page.locator(".hero-primary");
    }

    async getPlacedOrderIds(){
        await this.orderIdLocs.first().waitFor();
        let orderIds = [];
        for (let i = 0; i < await this.orderIdLocs.count(); i++) {
            //playwright does not allow to directly get the text content of the locator which has multiple elements,
            //so we need to iterate over the elements and get the text content one by one
            //and auto-waiting isnt supported for textContent method, so we need to wait for the element to be visible before getting the text content
            let orderId = await this.orderIdLocs.nth(i).textContent();
            orderIds.push(((orderId.split("|"))[1]).trim());
        }
        console.log("orderIds ", orderIds);
        return orderIds;
    }

    async getOrderGreetings(){
        return this.orderGreetings;
    }

    async clickOrdersHistory(){
        await this.OrderHistoryLink.click();
    }

}