import * as cheerio from 'cheerio';
import { Browser } from 'puppeteer-core';
import getBrowser from './puppeteer';
import nameTransformer from './nameTransformer';
import { CarObject, CarValues } from '../interfaces/general';

export default async function polovniHandler(
  data: CarValues,
  resultList: any[],
  pageNum: number
) {
  const browser = await getBrowser();
  const urls: Array<string> = [];
  const transformedValues = nameTransformer(data);
  // Generate urls for pages:
  for (let i = 1; i <= pageNum; i += 1) {
    const polovniUrl = `https://www.polovniautomobili.com/auto-oglasi/pretraga?page=${i}&brand=${transformedValues.polovni.makeId}&model[]=${transformedValues.polovni.modelId}&year_from=${data.carYearStart}&year_to=${data.carYearEnd}`;
    urls.push(polovniUrl);
  }

  await scrapePolovni(browser, urls, resultList);

  if (browser.isConnected()) {
    await browser.close();
  }
}

async function scrapePolovni(
  browser: Browser,
  urlsArray: string[],
  resultList: any[]
) {
  let timeIsUp = false;

  setTimeout(() => {
    timeIsUp = true;
  }, 8700);

  for (let x = 0; x < urlsArray.length; x += 1) {
    if (timeIsUp) {
      console.log('time is up.');
      return;
    }

    // eslint-disable-next-line no-await-in-loop
    await scrapePolovniPage(browser, urlsArray[x], resultList);
  }
}

async function scrapePolovniPage(
  browser: Browser,
  url: string,
  resultList: CarObject[]
) {
  const page = await browser.newPage();
  await Promise.all([
    page.waitForResponse(async (response) => {
      if (
        response.url().includes('pretraga?') &&
        response.headers()['content-type'] === 'text/html; charset=UTF-8'
      ) {
        // load html with cheerio
        const dataHtml = await response.text();

        const $ = cheerio.load(dataHtml);

        // gather data

        const ordinaryList = $('article[class*="classified"]');
        console.log('before EACH');
        $(ordinaryList).each((i, e) => {
          console.log('inside each');
          // if element is hidden, don't load it
          let hidden = false;
          try {
            const element = $(e).find('div[class="textContentHolder"]').length;
            if (element === 0) {
              hidden = true;
            }
          } catch (error) {
            //
          }
          if (hidden) {
            return;
          }
          let priceDiscount;
          let priceRaw;
          const nameRaw = $(e).find('a[class="ga-title"]').text().trim();
          const linkRaw = $(e).find('a[class="ga-title"]').attr('href')?.trim();
          const imageLink = $(e)
            .find('[class="image"]')
            .find('img')
            .attr('data-src');
          try {
            const x = $(e).find('span[class*="discount"i]');
            if (x.length > 0) {
              // eslint-disable-next-line prefer-destructuring
              priceDiscount = x
                .text()
                .trim()
                .replace('.', '')
                .replace(' €', '')
                .replace(/\t/g, '')
                .replace(/\n/g, '')
                .split('+')[0]
                .trim();
            }
          } catch (error) {
            console.log(error);
          }
          if (priceDiscount === undefined || priceDiscount === '') {
            // eslint-disable-next-line prefer-destructuring
            priceRaw = $(e)
              .find('div[class*="price"]')
              .text()
              .trim()
              .replace('.', '')
              .replace(' €', '')
              .replace(/\t/g, '')
              .replace(/\n/g, '')
              .split('+')[0]
              .trim();
          }
          console.log(priceRaw);
          if (priceRaw === undefined || priceRaw === '') {
            priceRaw = 'no price';
          }
          const descriptionRaw1 = $(e).find('div[class*="setInfo"]')[0];
          const descriptionRaw2 = $(e).find('div[class*="setInfo"]')[1];
          const year = $(descriptionRaw1)
            .find('div[class="top"]')
            .text()
            .match(/\d+/g)?.[0];
          const fuel = $(descriptionRaw1)
            .find('div[class="bottom"]')
            .text()
            .split('|')[0]
            .trim();
          let cc;

          try {
            const includesDigits = $(descriptionRaw1)
              .find('div[class="bottom"]')
              .text()
              .match(/\d+/g);
            if (includesDigits === null) {
              cc = $(descriptionRaw1).find('div[class="bottom"]').text().trim();
            }
          } catch (error) {
            //
          }
          if (cc === undefined) {
            cc = $(descriptionRaw1)
              .find('div[class="bottom"]')
              .text()
              .match(/\d+/g)?.[0];
          }
          const name = nameRaw;
          const km = $(descriptionRaw2)
            .find('div[class="top"]')
            .text()
            .replace(' km', '')
            .replace('.', '');
          const link = `https://www.polovniautomobili.com${linkRaw}`;

          const object: CarObject = {
            CarName: name,
            CarPrice: priceDiscount !== undefined ? priceDiscount : priceRaw,
            CarFuel: fuel,
            CarKM: km,
            CarCC: cc !== undefined ? cc : 'no data',
            CarYear: year !== undefined ? year : 'no data',
            Href: link,
            Id: '',
            ImageUrl: imageLink === undefined ? 'no data' : imageLink,
          };
          resultList.push(object);
        });
        return true;
      }

      return false;
    }),
    await page.goto(url, { waitUntil: 'domcontentloaded' }),
  ]);

  await page.close();
}
