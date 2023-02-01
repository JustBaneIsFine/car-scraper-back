import express from 'express';
import scrapeTest from './ts/scrapeTest';

const scrapingRouter = express.Router();

/* GET home page. */
scrapingRouter.get('/', async (req, res, next) => {
  const result = await scrapeTest();
  res.send(result);
});

export default scrapingRouter;
