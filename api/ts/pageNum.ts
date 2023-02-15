import { CarValues } from '../interfaces/general';
import nameTransformer from './nameTransformer';
import getBrowser from './puppeteer';

export default async function getPageNum(data: CarValues) {
  const transformedValues = nameTransformer(data);
  console.log(transformedValues);

  // create URL's for data
  // const kupujemUrl = `https://novi.kupujemprodajem.com/automobili/pretraga?categoryId=2013&groupId=${transformedValues.kupujem.makeId}&carModel=${transformedValues.kupujem.modelId}&vehicleMakeYearMin=${data.carYearStart}.&vehicleMakeYearMax=${data.carYearEnd}.&page=1`;
  const polovniUrl = `https://www.polovniautomobili.com/auto-oglasi/pretraga?page=1&brand=${transformedValues.polovni.makeId}&model[]=${transformedValues.polovni.modelId}&year_from=${data.carYearStart}&year_to=${data.carYearEnd}`;

  const polovniResult = await polovniPageNum(polovniUrl);
  // const kupujemResult = await kupujemPageNum(kupujemUrl);

  return {
    polovniResultNum: polovniResult,
    // kupujemResultNum: kupujemResult,
  };
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

async function polovniPageNum(url: string) {
  const browser = await getBrowser();
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  await page.waitForSelector('.paBlueButtonPrimary');

  const dataIsThere = await page.evaluate(async () => {
    const text = document.querySelector('.paBlueButtonPrimary')?.parentElement
      ?.parentElement?.innerText;

    if (text !== undefined && text.includes('Trenutno nema rezultata')) {
      return false;
    }
    return true;
  });

  if (dataIsThere === false) {
    return 'there is no data';
  }

  const pageNum: number | undefined = await page.evaluate(() => {
    const smallText: HTMLElement | null = document.querySelector(
      'div.js-hide-on-filter:nth-child(3) > small:nth-child(1)'
    );

    if (smallText !== null && smallText !== undefined) {
      const numOfAds = smallText.innerText;
      const number: number = parseInt(
        numOfAds.slice(-5).replace(/\D/g, ''),
        10
      );
      return Math.ceil(number / 25);
    }
    return undefined;
  });

  return pageNum;
}
