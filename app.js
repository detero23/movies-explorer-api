require('dotenv').config();
/* eslint-disable no-console */
const express = require('express');
const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
const cors = require('cors');
const { celebrate, Joi } = require('celebrate');
const { errors } = require('celebrate');
const { requestLogger, errorLogger } = require('./middlewares/logger');

if (process.env.NODE_ENV !== 'production') {
  process.env.PORT = 3000;
  process.env.DB_ADDRESS = 'mongodb://127.0.0.1:27017/bitfilmsdb';
}

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const auth = require('./middlewares/auth');
const NotFoundError = require('./errors/NotFoundError');

mongoose
  .connect(process.env.DB_ADDRESS, {
    useNewUrlParser: true,
  })
  .then(() => console.log('Connected'))
  .catch((err) => console.log(`Connection error '${err.name}' - '${err.message}'`));

const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(requestLogger);
app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});
app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
}), require('./controllers/users').login);
app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
    name: Joi.string().required().min(2).max(30),
  }),
}), require('./controllers/users').createUser);
app.use('/movies', auth, require('./routes/movies'));
app.use('/users', auth, require('./routes/users'));

app.use(() => { throw new NotFoundError('Ошибка 404 Страница не найдена'); });
app.use(errorLogger);
app.use(errors());
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res
    .status(statusCode)
    .send({
      message: statusCode === 500
        ? 'На сервере произошла ошибка'
        : message,
    });
});
app.listen(process.env.PORT, () => {
  console.log(`App listening on port ${process.env.PORT}`);
});
