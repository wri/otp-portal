const puppeteer = require("puppeteer");

puppeteer
  .launch({
    defaultViewport: {
      width: 2560,
      height: 800
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
      quality: 80,
      path: "../../static/images/home/bg-map.jpg",
      clip: {
        x: 0,
        y: 0,
        width: 2560,
        height: 720
      }
    });
    await browser.close();
  });
