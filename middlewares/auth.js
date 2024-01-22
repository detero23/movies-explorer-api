require('dotenv').config();
const jwt = require('jsonwebtoken');
const NoAuthError = require('../errors/NoAuthError');

const { NODE_ENV, JWT_SECRET } = process.env;

// eslint-disable-next-line consistent-return
module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new NoAuthError('Требуется авторизация'));
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'super-hard-key');
  } catch (err) {
    return next(new NoAuthError('Требуется авторизация'));
  }

  req.user = payload;
  next();
};
