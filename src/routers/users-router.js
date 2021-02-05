const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const logger = require('../middleware/logger');
const validateJWT = require('../middleware/jwt-auth');
const BootcampService = require('../services/bootcamp-service');
const CourseRepo = require('../repositories/courses-repository');
const CourseService = require('../services/course-service');
const UsersRepo = require('../repositories/users-repository');
const usersRouter = express.Router();
const bodyParser = express.json();

usersRouter
  .route('/api/users/register')
  .post(bodyParser, (req, res, next) => {
    const { first_name, last_name, user_name, password } = req.body
    const newUser = { first_name, last_name, user_name, password }
    const knexInstance = req.app.get('db')
    const saltRounds = 10;

    for (const [key, value] of Object.entries(newUser))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        })
    
    UsersRepo.getUserWithUsername(knexInstance, user_name)
      .then(dbUser => {
        if (dbUser) {
          return res.status(400).json({ error: 'Username already exists.' }) 
        }
        else {
          //encrypt pw and overwrite plaintext pw on newUser object
          bcrypt.hash(password, saltRounds, function(err, hash) {
            if (err) {
              logger.error(err)
              return res.status(400).send('Something went wrong.');
            }
            else {
              newUser.password = hash;
              UsersRepo.createUser(knexInstance, newUser)
              .then(newUser => {
                return res.status(201).json(newUser)
              })
              .catch(next)
            }
          })
        }
      })
  })

usersRouter
  .route('/api/users/login')
  .post(bodyParser, (req,res,next) => {
    const { user_name, password } = req.body
    const loginUser = { user_name, password }
    const knexInstance = req.app.get('db')

    for (const [key, value] of Object.entries(loginUser))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        })

    UsersRepo.getUserWithUsername(knexInstance, loginUser.user_name)
      .then(dbUser => {
        if (!dbUser) {
          return res.status(400).json({ error: 'Incorrect user_name or password' }) 
        }
        else { 
          UsersRepo.comparePasswords(loginUser.password, dbUser.password)
            .then(match => {
              if (!match)
                return res.status(400).json({ error: 'Incorrect user_name or password' })
              else {
                UsersRepo.postLogin(knexInstance, user_name, dbUser.password)
                  const payload = {
                    user_name : loginUser.user_name,
                    first_name: dbUser.first_name,
                    last_name: dbUser.last_name
                  }
                  jwt.sign(payload, JWT_SECRET, { expiresIn: '30m' }, function(err, token) {
                    if (err) {
                      return res.status( 406 ).send( 'Something went wrong' );
                    }
                    else {
                      return res.status( 202 ).json({ token } ) 
                    }
                  })
              }
            })
        }
      })
  })

usersRouter
  .get('/api/users/validate', validateJWT, (req, res) => {
    return res.status(200).send( { message: `Successful Authentication`} );
  })

usersRouter
  .route('/api/user/courses')
  .get(validateJWT, (req,res,next) => {
    const token = jwt.decode(req.headers.session_token)
    const knexInstance = req.app.get('db')

    UsersRepo.getUserCourses(knexInstance, token.user_name)
      .then(userCourses => {
        res.json(userCourses)
      })
      .catch(next)
  })

  .post(bodyParser, validateJWT, (req, res, next) => {

    for (const [key, value] of Object.entries(req.body))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        })
      
      const bootcampName = req.body.Bootcamp
      const courseName = req.body.Course.Name
      const user_name = req.body.UserName
      const schedule = req.body.Course.Schedule.Type
      const knexInstance = req.app.get('db')
      
      //look up course by bootcamp and course name
      BootcampService.getBootcampAndCourse(knexInstance, bootcampName, courseName)
        .then(bootcamp => {
          let userCourse = {
            course_id: bootcamp.Course_id,
            user_name: user_name,
          }

          CourseRepo.getScheduleByCourseAndSchedule(knexInstance, bootcamp.Course_id, schedule)
            .then(schedule => {
              userCourse.schedule_type = schedule.id

              UsersRepo.addUserCourse(knexInstance, userCourse)
                .then(course => {
                  return res.status(201).json(course)
                })
                .catch(next)
            })
            .catch(next)
    
        })
  })

usersRouter
  .route('/api/user/course/:course_id')
  .get(validateJWT, (req, res) => {
    const knexInstance = req.app.get('db')
    const { course_id } = req.params

    CourseService.getCourseInformation(knexInstance, course_id)
      .then(info => {
        return res.json(info)
      })
  })

  .delete(validateJWT, (req, res, next) => {
    const { course_id } = req.params
    const token = jwt.decode(req.headers.session_token)
    const knexInstance = req.app.get('db')

    UsersRepo.getUserCourseSchedule(knexInstance, course_id)
      .then(schedule => {
        const schedule_type = schedule.id

        UsersRepo.deleteUserCourse(knexInstance, course_id, token.user_name, schedule_type)
          .then(numRowsAffected => {
            if(numRowsAffected !== 1) {
              logger.error(`Course with id ${course_id} not found.`)
              return res.status(404).json({
                error: { message: `Course Not Found.`}
              })
            }
            logger.info(`Course with id ${course_id} deleted.`)
            res.status(204).end() 
          })
      })

      .catch(next)
  })

module.exports = usersRouter;
