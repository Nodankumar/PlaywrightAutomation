export class LoginPage{

    usernameLoc;
    passwordLoc;
    signInBtn;
    page;

    constructor(page){
        this.page = page;
        this.usernameLoc = this.page.getByPlaceholder("email@example.com");
        this.passwordLoc = this.page.locator("#userPassword");
        this.signInBtn = this.page.getByRole("button", {name: "Login"});
    }

    async gotoLoginPage(){
        await this.page.goto("https://rahulshettyacademy.com/client/#/auth/login");
    }

    async doLogin(username, password){
        await this.usernameLoc.fill(username);
        await this.passwordLoc.fill(password);
        await this.signInBtn.click();
    }


}