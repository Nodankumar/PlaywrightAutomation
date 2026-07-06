export class EcomAppUtil {

    request;
    loginPayload;

    constructor(request, loginPayload) {
        this.request = request;
        this.loginPayload = loginPayload;
    }

    async getToken() {
        const response = await this.request.post("https://rahulshettyacademy.com/api/ecom/auth/login",
            {
                data: this.loginPayload
            });

        const responseBody = await response.json();
        const token = responseBody.token;
        return token;
    }

    async createOrder(orderPayload) {
        const response = await this.request.post(
            "https://rahulshettyacademy.com/api/ecom/order/create-order",
            {
                headers: {
                    "content-type": "application/json; charset=utf-8",
                    "authorization": await this.getToken()
                },
                data: orderPayload
            }
        );
        return response;
    }

}