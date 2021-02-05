const express = require('express');
const validateJWT = require('../middleware/jwt-auth');
const SearchService = require('../services/search-service');
const searchRouter = express.Router();
const bodyParser = express.json();

searchRouter //responsibility is to hand off input to service to get results
  .route('/api/search')
  .post(validateJWT, bodyParser, (req,res,next) => {
    const { stateCode, is_online, prior_experience, schedule, fin_assist } = req.body
    const searchRequest = { stateCode, is_online, prior_experience, schedule, fin_assist }
    const knexInstance = req.app.get('db')

    for (const [key, value] of Object.entries(searchRequest))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        })
    
    SearchService.getResults(knexInstance, searchRequest) //need to send something back from the POST. We need a return here
      .then(results => {
        return res.json(results)
      })
  })

module.exports = searchRouter;