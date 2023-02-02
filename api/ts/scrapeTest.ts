import chrome from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';

const exePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function getBrowser() {
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

export default async function scrapeTest() {
  // const browser = await puppeteer.launch();
  // const page = await browser.newPage();
  // await page.goto('https://google.com', { waitUntil: 'load' });
  // const result = await page.evaluate(() => {
  //   const list = document.getElementsByTagName('a');
  //   const array: string[] = [];

  //   for (let i = 0; i < list.length; i += 1) {
  //     array.push(list[i].innerText);
  //   }
  //   return array;
  // });

  // await browser.close();
  const browser = await getBrowser();
  const page = await browser.newPage();
  await page.goto('https://google.com', { waitUntil: 'load' });
  const result = await page.evaluate(() => {
    const list = document.getElementsByTagName('a');
    const array: string[] = [];

    for (let i = 0; i < list.length; i += 1) {
      array.push(list[i].innerText);
    }
    return array;
  });
  return result;
}
