import assert from "node:assert/strict";
import puppeteer from "puppeteer";

const browser = await puppeteer.launch({ headless: true });
const errors = [];
const expectedSections = ["home", "work", "products", "services", "about", "contact"];

try {
  const page = await browser.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  for (const width of [375, 390, 760, 768, 1440]) {
    const isMobile = width <= 760;
    await page.setViewport({
      width,
      height: isMobile ? 844 : 1000,
      deviceScaleFactor: 1,
      isMobile,
      hasTouch: isMobile,
    });

    const response = await page.goto("http://localhost:3000", { waitUntil: "networkidle2" });
    assert.equal(response.status(), 200, `Expected HTTP 200 at ${width}px.`);

    const result = await page.evaluate(() => {
      const redNotGreen = (color) => {
        const [red, green, blue] = color.match(/[\d.]+/g).map(Number);
        return red > green && blue >= green;
      };
      const warmAccent = (color) => {
        const [red, green, blue] = color.match(/[\d.]+/g).map(Number);
        return red > green + 15 && red > blue + 15;
      };

      return {
        title: document.title,
        sections: [...document.querySelectorAll("main section")].map((section) => section.id),
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: document.documentElement.clientWidth,
        oldLimePalettePresent: /d9e996|217,\s*233,\s*150/i.test(document.querySelector("style").textContent),
        darkColorsAreWarm: [".work", ".services", ".contact", ".site-footer"]
          .every((selector) => redNotGreen(getComputedStyle(document.querySelector(selector)).backgroundColor)),
        productHighlightsAreWarm: warmAccent(
          getComputedStyle(document.querySelector(".habit-board i:nth-child(2)")).backgroundColor,
        ),
        legend: [...document.querySelectorAll(".nav-links a")].map((link) => link.getAttribute("href")),
      };
    });

    assert.deepEqual(result.sections, expectedSections, `Missing or reordered sections at ${width}px.`);
    assert.ok(result.documentWidth <= result.viewportWidth, `Horizontal overflow at ${width}px.`);
    assert.equal(result.oldLimePalettePresent, false, "The old green accent returned in the palette.");
    assert.equal(result.darkColorsAreWarm, true, "A dark section has a green-tinted background.");
    assert.equal(result.productHighlightsAreWarm, true, "The Habit Tracker artwork has a green tint.");
    assert.deepEqual(result.legend, expectedSections.map((section) => `#${section}`));
    console.log(`${width}px: all six sections, warm palette, and responsive layout verified.`);

    if (width === 375) {
      await page.click(".menu-toggle");
      assert.equal(
        await page.$eval(".menu-toggle", (button) => button.getAttribute("aria-expanded")),
        "true",
        "The mobile navigation should open.",
      );
      assert.notEqual(
        await page.$eval("#primary-navigation", (navigation) => getComputedStyle(navigation).display),
        "none",
        "The open mobile navigation should be visible.",
      );

      await page.click("#primary-navigation a[href='#work']");
      assert.equal(
        await page.$eval(".menu-toggle", (button) => button.getAttribute("aria-expanded")),
        "false",
        "The mobile navigation should close when a link is selected.",
      );
      console.log("Mobile navigation opens, follows links, and closes.");
    }
  }

  assert.deepEqual(errors, [], `The browser reported errors: ${errors.join("; ")}`);
  console.log("Browser console and page scripts: no errors.");
} finally {
  await browser.close();
}
