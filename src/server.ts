import express from 'express';
import cors from 'cors';
// import session from 'express-session';

import indexRouter from './api/index';
import usersRouter from './api/users';

const port = process.env.PORT || 3000;
const app = express();

// app.use(logger('dev'));
const allowedOrigins = [
  'http://localhost:5173',
  'https://car-scraper-api.vercel.app',
];

app.use(
  cors({
    origin: allowedOrigins,
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
app.use((req, res) => {
  res.send('error2');
});
app.listen(port, () => {
  console.log(`Listening on port 2 ${port}`);
});
export default app;
