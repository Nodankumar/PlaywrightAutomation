export class PlaceOrderPage {

    creditCardNumInput;
    cvvInput;
    expiryMonthLoc;
    expiryDayLoc;
    cardHolderNameInput;
    couponInput;
    applyCouponBtn;
    couponAppliedTextLoc;
    shiipingEmail;
    countryDDInput;
    suggestedDD;
    placeOrderBtn;
    page;

    constructor(page) {
        this.page = page;
        this.creditCardNumInput = this.page.locator("//div[normalize-space(text()) = 'Credit Card Number']/following-sibling::input");
        this.cvvInput = this.page.locator("//div[text()='CVV Code ']/following-sibling::input");
        this.expiryMonthLoc = this.page.locator(".field .ddl").first();
        this.expiryDayLoc = this.page.locator(".field .ddl").last();
        this.cardHolderNameInput = this.page.locator("//div[normalize-space(text())='Name on Card']/following-sibling::input");
        this.couponInput = this.page.locator("[name='coupon']");
        this.applyCouponBtn = this.page.locator(".field .mt-1").last();
        this.couponAppliedTextLoc = this.page.locator(".field .mt-1").first();
        this.shiipingEmail = this.page.locator(".user__name>input");
        this.countryDDInput = this.page.getByPlaceholder("Select Country");
        this.suggestedDD = this.page.locator(".ta-results span");
        this.placeOrderBtn = this.page.locator("text=Place Order");
    }

    async enterCardDetails(creditCardNumber, expiryMonth, expiryDay, cvv, cardHolderName) {
        await this.creditCardNumInput.fill(creditCardNumber);
        await this.cvvInput.fill(cvv);
        await this.expiryMonthLoc.selectOption(expiryMonth);
        await this.expiryDayLoc.selectOption(expiryDay);
        await this.cardHolderNameInput.fill(cardHolderName);
    }

    async applyCoupon(coupoValue) {
        await this.couponInput.fill(coupoValue);
        await this.applyCouponBtn.click();
    }

    async couponAppliedText() {
        return this.couponAppliedTextLoc;
    }

    async getShippingEmail() {
        const email = await this.shiipingEmail.inputValue();
        //verify email
        console.log("email associated with the order: ", email);
        return email;
    }

    async selectCountry(countryName) {
        //select country and verify dropdown options
        //pressSquentially is used to type the text in the input field one by one with a delay, 
        //it will also trigger the dropdown options based on the input text
        await this.countryDDInput.pressSequentially(countryName, { delay: 100 });
        await this.suggestedDD.first().waitFor();

        for (let i = 0; i < await this.suggestedDD.count(); i++) {
            const countryLoc = this.suggestedDD.nth(i);
            let countryText = await countryLoc.textContent();
            console.log("Country from dd: ", countryText);
            if (countryText.trim().toLowerCase() === countryName) {
                await countryLoc.click();
                break;
            }
        }

    }

    async clickPlaceOrderBtn(){
        await this.placeOrderBtn.click();
    }

}