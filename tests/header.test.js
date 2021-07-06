const Page = require("./helpers/page");

let page;

// This function will run before each test.
beforeEach(async () => {
  // This is our new custom page we created (using Proxy)
  // Now, this custom page has all the functions of
  // our customPage, Puppeteer's page and Puppeteer's browser.
  page = await Page.build();

  // page should navigate to the application
  await page.goto("http://localhost:3000");
});

// This fn runs after each test runs.
afterEach(async () => {
  // since, the custom page has access to browser object as well.
  await page.close();
});

test("The header has the correct text", async () => {
  // Puppeteer takes the following code and seirializes it to the text
  // This text is then communicated with our node js runtime to the chromium browser.
  // It then gets parsed into javascript code and evaluated inside the browser.
  const text = await page.getContentsOf("a.brand-logo");

  // Making assertion, 'assert' and 'should' works in the same way.
  expect(text).toEqual("Blogster");
});

test("clicking login start oauth flow", async () => {
  // before we can do click, we have to inspect the element
  await page.click(".right a");

  const url = await page.url();

  expect(url).toMatch(/accounts\.google\.com/);
});

test("When signed in, shows logout button", async () => {
  // FAKE SIGNING
  // This is our custom page
  await page.login();

  // Selecting logout element, be sure to use two different kind of quotes or else
  // it will show the unterminated string error. el is short for element.
  const text = await page.getContentsOf('a[href="/auth/logout"]');

  expect(text).toEqual("Logout");
});
