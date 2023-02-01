import express from 'express';

const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  let x = 'It works after 5 seconds';
  setTimeout(() => {
    res.send(x);
  }, 6000);
});

export default router;
