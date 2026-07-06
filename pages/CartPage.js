export class CartPage {

    cartItemsLoc;
    checkoutBtn;
    page;

    constructor(page) {
        this.page = page;
        this.cartItemsLoc = this.page.locator(".cartWrap .items");
        this.checkoutBtn = this.page.locator(".totalRow [type='button']");
    }

    async isAddedProductVisible(productName) {

        //wait for cart items to be visible
        await this.cartItemsLoc.first().waitFor();
        let noOfItemsInCart = await this.cartItemsLoc.count();
        console.log("NoOfItemsInCart: ", noOfItemsInCart);
        let isItemAdded = await this.cartItemsLoc.locator(`text=${productName}`).isVisible();
        console.log("isItemAdded: ", await this.cartItemsLoc.locator(`text=${productName}`).textContent());
        return isItemAdded;
    }

    async clickCheckoutBtn(){
        await this.checkoutBtn.click();
    }

}