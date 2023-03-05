import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import cors from 'cors';
import indexRouter from './api/index';
import scrapeRouter from './api/scrape';
import registerRouter from './api/register';
import loginRouter, { loginCheck } from './api/login';
import logoutRouter from './api/logout';
import getURI from './api/mongoCom/uri';
import returnIndexRouter from './api/clientRouting';

const port = process.env.PORT || 3000;
const app = express();
const uri = getURI();
console.log('uri:-----', uri);
app.use(
  cors({
    origin: 'https://car-scraper.netlify.app',
    credentials: true,
  })
);
// https://car-scraper.netlify.app
// http://localhost:3002
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: 'secretKeyx21',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
    store: MongoStore.create({
      mongoUrl: uri,
      dbName: 'Car-Scraper',
      collectionName: 'Sessions',
    }),
  })
);

app.use('/', indexRouter);
app.use('/scrape', scrapeRouter);
app.use('/register', registerRouter);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);
app.use('/loginCheck', loginCheck);
app.use('/*', returnIndexRouter);
app.use((req, res) => {
  res.send('error2');
});
app.listen(port, () => {
  console.log(`Listening on port 2 ${port}`);
});
export default app;
