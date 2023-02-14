import chrome from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';

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
        headless: false,
      };

  const browser = await puppeteer.launch(options);
  return browser;
}
