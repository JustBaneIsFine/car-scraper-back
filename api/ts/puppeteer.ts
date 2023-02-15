import chrome from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-extra';
import stealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(stealthPlugin());

const exePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

export default async function getBrowser() {
  const options = process.env.AWS_REGION
    ? {
        args: chrome.args,
        executablePath: await chrome.executablePath,
        headless: chrome.headless,
      }
    : {
        args: [],
        executablePath: exePath,
        headless: true,
      };

  const browser = await puppeteer.launch(options);
  return browser;
}
