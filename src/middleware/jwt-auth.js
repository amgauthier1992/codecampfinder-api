const jwt = require( 'jsonwebtoken' );
const { JWT_SECRET } = require('../config');
const logger = require('./logger');

function validateJWT(req, res, next) {
  const { session_token } = req.headers; 
  jwt.verify(session_token, JWT_SECRET, function(err, decoded) {
    if(err){
      logger.error(err)
      return res.status(401).send('Unauthorized Request');
    }
    else {
      req.user = decoded; //here we are adding the decoded info to the user 
      //property of the request object. The auth header will be sent from the
      //client side during the fetch calls
      next();
    }
  });
}
  
module.exports = validateJWT
