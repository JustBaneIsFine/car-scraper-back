import puppeteer from 'puppeteer';

export default async function scrapeTest() {
  const browser = await puppeteer.launch();
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

  await browser.close();

  return result;
}
