import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import puppeteer from "puppeteer";

const [url, rawLabel = "", rawViewport = "desktop"] = process.argv.slice(2);
if (!url) {
  console.error("Usage: node screenshot.mjs <url> [label] [desktop|mobile]");
  process.exit(1);
}

const parsedUrl = new URL(url);
if (!["http:", "https:"].includes(parsedUrl.protocol)) {
  throw new Error("Screenshot URLs must use http or https.");
}

const viewport = rawViewport.toLowerCase();
if (!["desktop", "mobile"].includes(viewport)) {
  throw new Error(`Unsupported screenshot viewport "${rawViewport}". Use desktop or mobile.`);
}

const outputDirectory = path.join(process.cwd(), "temporary screenshots");
await mkdir(outputDirectory, { recursive: true });
const safeLabel = rawLabel.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const existingFiles = await readdir(outputDirectory);
const sequence = existingFiles.reduce((highest, filename) => {
  const match = /^screenshot-(\d+)(?:-[^.]+)?\.png$/i.exec(filename);
  return match ? Math.max(highest, Number(match[1])) : highest;
}, 0) + 1;
const filename = `screenshot-${sequence}${safeLabel ? `-${safeLabel}` : ""}.png`;
const browser = await puppeteer.launch({ headless: true });

try {
  const page = await browser.newPage();
  await page.setViewport({
    width: viewport === "mobile" ? 390 : 1440,
    height: viewport === "mobile" ? 844 : 1000,
    deviceScaleFactor: 1,
    isMobile: viewport === "mobile",
    hasTouch: viewport === "mobile",
  });
  if (page.viewport().width !== (viewport === "mobile" ? 390 : 1440)) {
    throw new Error(`Browser failed to set the requested ${viewport} screenshot viewport.`);
  }
  await page.goto(parsedUrl.href, { waitUntil: "networkidle2" });
  await page.screenshot({
    path: path.join(outputDirectory, filename),
    fullPage: true,
    animations: "disabled",
  });
  console.log(`Screenshot saved to ${path.join(outputDirectory, filename)}`);
} finally {
  await browser.close();
}
