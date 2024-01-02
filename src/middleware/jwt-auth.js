const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const logger = require('./logger');

function validateJWT(req, res, next) {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    return res.status(401).send('Unauthorized Request');
  }

  const token = authorizationHeader.split(' ')[1];

  jwt.verify(token, JWT_SECRET, function (err, decoded) {
    if (err) {
      logger.error(err);
      return res.status(401).send('Unauthorized Request');
    } else {
      req.user = decoded;
      next();
    }
  });
}

module.exports = validateJWT;
