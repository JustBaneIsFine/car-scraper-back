import * as cheerio from 'cheerio';
import { CarValues } from '../interfaces/general';
import nameTransformer from './nameTransformer';
import getBrowser from './puppeteer';

export default async function getPageNum(data: CarValues) {
  console.log('transforming values');
  const transformedValues = nameTransformer(data);
  if (
    transformedValues.polovni.makeId === undefined ||
    transformedValues.polovni.modelId === undefined
  ) {
    return false;
  }
  console.log('values transformed');
  // create URL's for data
  // const kupujemUrl = `https://novi.kupujemprodajem.com/automobili/pretraga?categoryId=2013&groupId=${transformedValues.kupujem.makeId}&carModel=${transformedValues.kupujem.modelId}&vehicleMakeYearMin=${data.carYearStart}.&vehicleMakeYearMax=${data.carYearEnd}.&page=1`;
  const polovniUrl = `https://www.polovniautomobili.com/auto-oglasi/pretraga?page=1&brand=${transformedValues.polovni.makeId}&model[]=${transformedValues.polovni.modelId}&year_from=${data.carYearStart}&year_to=${data.carYearEnd}`;
  console.log('going into polovni page num');
  const polovniResult = await polovniPageNum(polovniUrl);
  // const kupujemResult = await kupujemPageNum(kupujemUrl);

  return polovniResult;
  // kupujemResultNum: kupujemResult,
}

// async function kupujemPageNum(url: string) {
//   const browser = await getBrowser();
//   const page = await browser.newPage();
//   await page.goto(url, { waitUntil: 'domcontentloaded' });

//   await page.waitForSelector('[class*=breadcrumbHolder]');

//   const dataIsThere = await page.evaluate(async () => {
//     const textNotification = document.querySelector(
//       '.NotificationBox_text__FgaiD'
//     );

//     if (textNotification === null) {
//       return true;
//     }
//     return false;
//   });

//   if (dataIsThere === false) {
//     return 'there is no data';
//   }

//   const pageNum: number | undefined = await page.evaluate(() => {
//     const resultNumber = document
//       .querySelector('[class*=breadcrumbHolder]')
//       ?.querySelector('span')
//       ?.querySelector('span');
//     const resultNumExtracted: any = resultNumber?.innerText.match(/(\d+)/)?.[0];

//     if (resultNumExtracted === undefined) {
//       return undefined;
//     }
//     return Math.ceil(resultNumExtracted / 30);
//   });

//   return pageNum;
// }

async function polovniPageNum(url: string): Promise<number | false> {
  const browser = await getBrowser();
  const page = await browser.newPage();
  let num: number | false = 0;
  console.log('waiting for response');
  await Promise.all([
    page.waitForResponse(async (response) => {
      if (
        response.url().includes('pretraga?') &&
        response.headers()['content-type'] === 'text/html; charset=UTF-8'
      ) {
        console.log('found response');
        // load html with cheerio
        const dataHtml = await response.text();
        console.log('loaded text');
        const $ = cheerio.load(dataHtml);

        const text = $('.reversre-search').text();
        console.log('found text');
        if (text !== null && text.includes('Trenutno nema rezultata')) {
          num = false;
          return true;
        }
        console.log('text is good');
        const smallText = $(
          'div.js-hide-on-filter:nth-child(3) > small:nth-child(1)'
        );
        console.log('found smallText');
        if (smallText !== null && smallText !== undefined) {
          const numOfAds = $(smallText).text();
          const number: number = parseInt(
            numOfAds.slice(-5).replace(/\D/g, ''),
            10
          );
          num = Math.ceil(number / 25);
          console.log('small text ');
          return true;
        }
        console.log('small text not good');
        return true;
      }
      return false;
    }),
    await page.goto(url, { waitUntil: 'domcontentloaded' }).then(() => {
      console.log('page loaded________________________');
    }),
  ]);
  console.log('finished everything');

  return num;
}
