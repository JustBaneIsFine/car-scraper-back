import * as cheerio from 'cheerio';
import { Browser } from 'puppeteer-core';
import { CarValues } from '../interfaces/general';
import nameTransformer from './nameTransformer';
import getBrowser from './puppeteer';

export default async function kupujemHandler(
  data: CarValues,
  resultList: any[],
  pageNum: string
) {
  console.log('handler runs');
  const browser = await getBrowser();
  console.log('handler runs after get browser');
  const urls: Array<string> = [];
  const pageNumber = parseInt(pageNum, 10);
  const transformedValues = nameTransformer(data);

  // Generate urls for pages:
  console.log(' iterate about to run');
  console.log(pageNum);
  try {
    for (let i = 1; i <= pageNumber; i += 1) {
      const kupujemUrl = `https://novi.kupujemprodajem.com/automobili/pretraga?categoryId=2013&groupId=${transformedValues.kupujem.makeId}&carModel=${transformedValues.kupujem.modelId}&vehicleMakeYearMin=${data.carYearStart}.&vehicleMakeYearMax=${data.carYearEnd}.&page={${i}}`;
      urls.push(kupujemUrl);
      console.log(' iterate runs');
    }
  } catch (error) {
    console.log(error);
  }
  console.log('after itterate');
  await scrapeKupujem(browser, urls, resultList);
  console.log(resultList.length, 'returned value 2');
  if (browser.isConnected()) {
    await browser.close();
  }
}

async function scrapeKupujem(
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
    await scrapeKupujemPage(browser, urlsArray[x], resultList);
    console.log(resultList.length, 'returned value 1');
  }
}

async function scrapeKupujemPage(
  browser: Browser,
  url: string,
  resultList: any[]
) {
  console.log('page scraping loads');
  console.log('looking for response');

  const page = await browser.newPage();
  console.log('new page opened');
  await Promise.all([
    page.waitForResponse(async (response) => {
      if (
        response.url().includes('pretraga?categoryId') &&
        response.headers()['content-type'] === 'text/html; charset=utf-8'
      ) {
        try {
          console.log('found response');

          const text = await response.text();
          const result: any = ['test'];
          const $ = cheerio.load(text);
          const list = $(text).find('[class*=AdItem_adOuterHolder]');

          if (list === null) {
            console.log('list is null');
            return false;
          }
          console.log('list found');
          console.log('about to itterate');

          list.each((i, e) => {
            console.log('itterating over items in list');
            const name = $(e).find('[class*=AdItem_name]').text();
            const price = $(e).find('[class*=AdItem_price_]').text();
            const imageUrl = $(e)
              .find('[class*=AdItem_imageHolder]')
              .find('img')
              .attr('src');
            const href = $(e).find('a').attr('href');
            const descriptionRaw = $(e)
              .find('[class*=AdItem_adTextHolder]')
              .find('p')
              .text();

            const id = '';
            const descriptionArray = descriptionRaw.split(',');
            const FuelAndDescArray = descriptionArray[3].split('.');
            const year = descriptionArray[0].match('[0-9]+')?.[0];
            const km = descriptionArray[1]
              .trim()
              .replaceAll('.', '')
              .replace(' km', '');
            const cc = descriptionArray[2].trim().replace(' cm3', '');
            const fuel = FuelAndDescArray[0].trim();

            const object = {
              Name: name,
              Price: price,
              Fuel: fuel,
              Km: km,
              Cc: cc,
              Year: year,
              Href: href,
              Id: id,
              ImageUrl: imageUrl,
            };
            console.log(object.Name);
            result.push(object);
          });

          resultList.push(result);
          return true;
        } catch (error) {
          console.log(error);
        }
      }

      return false;
    }),
    await page.goto(url, { waitUntil: 'domcontentloaded' }),
  ]);

  await page.close();
}
