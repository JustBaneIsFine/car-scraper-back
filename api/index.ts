import express from 'express';

const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  res.send('Index page');
});

export default router;
