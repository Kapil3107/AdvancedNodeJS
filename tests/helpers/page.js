const puppeteer = require("puppeteer");

const sessionFactory = require("../factories/sessionFactory");
const userFactory = require("../factories/userFactory");

class CustomPage {
  static async build() {
    // browser is a new object that represents a running browser window.
    const browser = await puppeteer.launch({
      headless: true,
      // By turning on no sandbox flag, it's going to dramatically
      // decrease the time that it takes to run in the virtual machine
      // created by travis.
      args: ["--no-sandbox"],
    });

    // Create a new tab (or page)
    const page = await browser.newPage();
    const customPage = new CustomPage(page);

    // Proxy is used to combine multiple objects, so that we can
    // use all the functions of every object.
    return new Proxy(customPage, {
      get: function (target, property) {
        // look for the property in all 3 objects
        // close property exists in browser and page both.
        // we want to give browser priority over page for that.
        return customPage[property] || browser[property] || page[property];
      },
    });
  }

  constructor(page) {
    this.page = page;
  }

  async login() {
    // Creating a new user id. If we use same user id everytime,
    //  then there might be some leaking problems.
    const user = await userFactory();

    const { session, sig } = sessionFactory(user);

    // Now we will take the sessionString and sig and set them on our
    // actual chromium instance. After that we will use the chromium instance
    // to sign in to our actual application (FAKE SIGNING)

    // find this on the puppeteer documentation.
    await this.page.setCookie({ name: "session", value: session });
    await this.page.setCookie({ name: "session.sig", value: sig });

    // Now we have to refresh the page, if we do not refresh
    // we will not get the updated logged in page
    await this.page.goto("http://localhost:3000/blogs");
    // Now, we have successfully faked the login without going to the whole OAuth flow.

    // Before evaluation, we are making sure that the page reloaded and logout sign is appeared.
    await this.page.waitFor('a[href="/auth/logout"]');
  }

  async getContentsOf(selector) {
    return this.page.$eval(selector, (el) => el.innerHTML);
  }
}

module.exports = CustomPage;
