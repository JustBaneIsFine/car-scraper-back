import express, { Request, Response } from 'express';
// import kupujemHandler from './ts/kupujemHandler';
import polovniHandler from './ts/polovniHandler';
import timeoutTimer from './ts/timer';
import getPageNum from './ts/pageNum';

const scrapeRouter = express.Router();

scrapeRouter.post('/', scrapeWebsites);

async function scrapeWebsites(req: Request, res: Response) {
  const resultPolovni: any[] = [];
  console.log(req.body);
  const pageNumberParsed = parseInt(req.body.pageNumPolovni, 10);

  try {
    await Promise.race([
      Promise.all([
        // kupujemHandler(reqData, resultKupujem, pageNumKup),
        polovniHandler(req.body.reqData, resultPolovni, pageNumberParsed),
      ]),
      timeoutTimer(9000),
    ]);
  } catch (e) {
    console.log('Timer error', e);
  }
  // res.json({ kupujemResult: resultKupujem, polovniResult: resultPolovni });
  if (resultPolovni.length === 0) {
    res.json({ data: false });
    return;
  }
  res.json({ data: resultPolovni });
}

scrapeRouter.post('/num', getNum);

async function getNum(req: Request, res: Response) {
  console.log(req.body);

  if (Object.keys(req.body).length < 4) {
    res.json({ data: false, error: 'invalid data 1' });
    return;
  }

  const result = await getPageNum(req.body);
  if (result === false) {
    res.json({ data: false, error: 'invalid data 2' });
    return;
  }
  res.json({ data: result, error: 'valid data 3' });
}
export default scrapeRouter;
