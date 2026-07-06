export class DashboardPage {

    allProductsLoc;
    cartLoc;
    page;

    constructor(page) {
        this.page = page;
        this.allProductsLoc = this.page.locator(".card .card-body");
        this.cartLoc = this.page.locator("[routerlink*='cart']");
    }

    async addProductToCart(productName) {
        //wait until produts are vissible on the page
        await this.allProductsLoc.first().waitFor({state:'visible'});
        //iterate over the products and add matching product
        for (let i = 0; i < await this.allProductsLoc.count(); i++) {
            const pName = await this.allProductsLoc.nth(i).locator("b").textContent();
            // console.log("pName ", pName);
            if (pName.trim() === productName) {
                await this.allProductsLoc.nth(i).locator("text=' Add To Cart'").click();
                break;
            }
        }
    }

    async clickOnCart(){
        await this.cartLoc.click()
    }
}