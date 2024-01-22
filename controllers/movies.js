const Movie = require('../models/movie');

const IncorrectDataError = require('../errors/IncorrectDataError');
const NotFoundError = require('../errors/NotFoundError');
const NoAccessError = require('../errors/NoAccessError');

module.exports.getMovies = (req, res, next) => {
  Movie.find({})
    .then((movies) => res.send({ data: movies }))
    .catch(next);
};

module.exports.createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    nameRU,
    nameEN,
    thumbnail,
  } = req.body;
  const owner = { _id: req.user._id };

  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailer,
    nameRU,
    nameEN,
    thumbnail,
    owner,
  })
    .then((movie) => res.status(201).send({ data: movie }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new IncorrectDataError('Ошибка валидации при создании фильма'));
      } else next(err);
    });
};

module.exports.deleteMovieById = (req, res, next) => {
  Movie.findOne({ _id: req.params.id })
    .then((movie) => {
      if (!movie) {
        throw new NotFoundError('Фильм не найден');
      }
      // eslint-disable-next-line eqeqeq
      if (req.user._id != movie.owner._id) {
        throw new NoAccessError('Cant delete other user movies');
      }
      return Movie.deleteOne({ _id: movie._id });
    })
    .then((movie) => {
      res.send({ data: movie });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(
          new IncorrectDataError('Некорректные данные фильма при удалении'),
        );
      } else next(err);
    });
};
