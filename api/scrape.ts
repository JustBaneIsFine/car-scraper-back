import express, { Request, Response } from 'express';
// import kupujemHandler from './ts/kupujemHandler';
import polovniHandler from './ts/polovniHandler';
import timeoutTimer from './ts/timer';
import getPageNum from './ts/pageNum';
import { CarRequestValues } from './interfaces/general';

const scrapeRouter = express.Router();

scrapeRouter.get('/', scrapeWebsites);

async function scrapeWebsites(req: Request, res: Response) {
  const reqData: CarRequestValues = req.body;
  const resultPolovni: any[] = [];
  // const resultKupujem: any[] = [];

  // const pageNumKup = reqData.kupujemNum > '10' ? '10' : reqData.kupujemNum;
  const pageNumPol = reqData.polovniNum > '10' ? '10' : reqData.polovniNum;

  try {
    await Promise.race([
      Promise.all([
        // kupujemHandler(reqData, resultKupujem, pageNumKup),
        polovniHandler(reqData, resultPolovni, pageNumPol),
      ]),
      timeoutTimer(9000),
    ]);
  } catch (e) {
    console.log(e);
  }
  // res.json({ kupujemResult: resultKupujem, polovniResult: resultPolovni });
  if (resultPolovni.length === 0) {
    res.json({ data: false });
  }
  res.json({ data: resultPolovni });
}

scrapeRouter.get('/num', getNum);

async function getNum(req: Request, res: Response) {
  const result = await getPageNum(req.body);
  res.json({ data: result });
}
export default scrapeRouter;
