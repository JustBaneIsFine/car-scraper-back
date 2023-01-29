"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const index_1 = __importDefault(require("./api/index"));
const users_1 = __importDefault(require("./api/users"));
const port = 3000;
const app = (0, express_1.default)();
// app.use(logger('dev'));
const allowedOrigins = 'http://localhost:5173';
const corsOptions = {
    origin: allowedOrigins,
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
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
app.use('/', index_1.default);
app.use('/users', users_1.default);
app.use((req, res) => {
    res.send('error2');
});
app.listen(port, () => {
    console.log(`Listening on port 2 ${port}`);
});
exports.default = app;
