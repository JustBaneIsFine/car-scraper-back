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
  for (let i = 1; i <= pageNumber; i += 1) {
    const kupujemUrl = `https://novi.kupujemprodajem.com/automobili/pretraga?categoryId=2013&groupId=${transformedValues.kupujem.makeId}&carModel=${transformedValues.kupujem.modelId}&vehicleMakeYearMin=${data.carYearStart}.&vehicleMakeYearMax=${data.carYearEnd}.&page={${i}}`;
    urls.push(kupujemUrl);
  }
  await scrapeKupujem(browser, urls, resultList);

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
        console.log('found response');
        const text = await response.text();
        const result: any = [];
        const $ = cheerio.load(text);
        const list = $(text).find('[class*=AdItem_adOuterHolder]');
        if (list === null) {
          return false;
        }

        $(list).each((i, e) => {
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

          result.push(object);
        });

        resultList.push(result);
        return true;
      }

      return false;
    }),
    await page.goto(url, { waitUntil: 'domcontentloaded' }),
  ]);
  if (resultList.length === 0) {
    console.log('length is 0');
  } else {
    console.log('there is some data');
  }
  await page.close();
}
