import express from 'express';

const router = express.Router();
/* GET users listing. */
router.get('/', (req, res, next) => {
  res.send('respond with a resourceee');
});

export default router;
