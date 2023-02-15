import chrome from 'chrome-aws-lambda';
import { addExtra } from 'puppeteer-extra';
import stealthPlugin from 'puppeteer-extra-plugin-stealth';

const puppeteerExtra = addExtra(chrome.puppeteer);
puppeteerExtra.use(stealthPlugin());

const exePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

export default async function getBrowser() {
  const options = process.env.AWS_REGION
    ? {
        args: chrome.args,
        defaultViewport: chrome.defaultViewport,
        executablePath: await chrome.executablePath,
        headless: chrome.headless,
      }
    : {
        args: [],
        executablePath: exePath,
        headless: true,
      };

  const browser = await puppeteerExtra.launch(options);
  return browser;
}
