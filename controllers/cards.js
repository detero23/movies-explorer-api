const Card = require('../models/card');

const IncorrectDataError = require('../errors/IncorrectDataError');
const NotFoundError = require('../errors/NotFoundError');
const NoAccessError = require('../errors/NoAccessError');

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch(next);
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = { _id: req.user._id };

  Card.create({ name, link, owner })
    .then((card) => res.status(201).send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new IncorrectDataError('Ошибка валидации при создании карточки'));
      } else next(err);
    });
};

module.exports.deleteCardById = (req, res, next) => {
  Card.findOne({ _id: req.params.id })
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка не найдена');
      }
      // eslint-disable-next-line eqeqeq
      if (req.user._id != card.owner._id) {
        throw new NoAccessError('Cant delete other user card');
      }
      return Card.deleteOne({ _id: card._id });
    })
    .then((card) => {
      res.send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new IncorrectDataError('Некорректные данные карточки при удалении'));
      } else next(err);
    });
};

module.exports.putCardLike = (req, res, next) => Card.findByIdAndUpdate(
  req.params.id,
  { $addToSet: { likes: req.user._id } },
  { new: true },
)
  .then((card) => {
    if (!card) {
      throw new NotFoundError('Карточка не найдена');
    }
    res.send({ data: card });
  })
  .catch((err) => {
    if (err.name === 'CastError') {
      next(new IncorrectDataError('Некорректные данные карточки при проставлении лайка'));
    } else next(err);
  });

module.exports.deleteCardLike = (req, res, next) => Card.findByIdAndUpdate(
  req.params.id,
  { $pull: { likes: req.user._id } },
  { new: true },
)
  .then((card) => {
    if (!card) {
      throw new NotFoundError('Карточка не найдена');
    }
    res.send({ data: card });
  })
  .catch((err) => {
    if (err.name === 'CastError') {
      next(new IncorrectDataError('Некорректные данные карточки при удалении лайка'));
    } else next(err);
  });
