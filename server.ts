import express from 'express';
import path from 'path';


import indexRouter from './routes/index';
import usersRouter from './routes/users';

const port = 3000;
const app = express();

//app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use(function (req, res) {
    res.send('error2');
  });
app.listen(port, () => {
    console.log(`Listening on port 2 ${port}`);
  });
export default app;
