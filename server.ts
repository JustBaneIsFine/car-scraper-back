import express from 'express';
import cors from 'cors';
// import session from 'express-session';

import indexRouter from './api/index';
import usersRouter from './api/users';
import testScraping from './api/testScraping';

const port = process.env.PORT || 3000;
const app = express();

// let isDevMode = false;
// if (process.env.USERNAME === 'Theseus') {
//   isDevMode = true;
// } else {
//   isDevMode = false;
// }
// console.log(process.env.USERNAME);
// // app.use(logger('dev'));
// const devOrigin = 'http://localhost:5173';
// const prodOrigin = 'https://car-scraper.netlify.app';

app.use(
  cors({
    origin: 'https://car-scraper.netlify.app',
    // origin: isDevMode ? devOrigin : prodOrigin,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(
//   session({
//     secret: 'secret',
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       maxAge: 1000 * 60 * 60 * 24,
//     },
//     store: MongoStore.create({
//       mongoUrl: uri.data,
//       dbName: 'sessions',
//       collectionName: 'sessionsTest',
//     }),
//   })
// );

// app.use(cookieParser());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/test', testScraping);
app.use((req, res) => {
  res.send('error2');
});
app.listen(port, () => {
  console.log(`Listening on port 2 ${port}`);
});
export default app;
