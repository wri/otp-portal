const puppeteer = require("puppeteer");

puppeteer
  .launch({
    defaultViewport: {
      width: 2560,
      height: 1300
    },
  })
  .then(async (browser) => {
    const page = await browser.newPage();
    await page.goto("http://localhost:4000/map", {
      waitUntil: 'networkidle0',
      timeout: 60000
    });
    await page.screenshot({
      type: 'jpeg',
      quality: 75,
      path: "../../static/images/home/bg-map.jpg"
    });
    await browser.close();
  });
