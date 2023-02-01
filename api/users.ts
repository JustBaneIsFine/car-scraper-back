import express from 'express';

const router = express.Router();
/* GET users listing. */
router.get('/', (req, res, next) => {
  let x = 'It works after 10 seconds';
  setTimeout(() => {
    res.send('');
  }, 11000);
});

export default router;
