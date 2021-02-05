const { NODE_ENV } = require('../config');
const logger = require('./logger');

function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'Server error' } };
  } else {
    logger.error(error.message)
    response = { message: error.message, error, stack: error.stack };
  }
  res.status(500).json(response);
}

module.exports = errorHandler