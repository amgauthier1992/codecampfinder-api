require('dotenv').config();
const knex = require('knex');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const { createLoginUser, createCourseObject } = require('./users.fixtures');

describe(`User Endpoints`, function() {
    
  let db;

  const truncateDB = () => {
    return db.raw(
      `TRUNCATE
        users,
        user_courses
      RESTART IDENTITY CASCADE`
    )
    .then(() => {
      console.log('Tables truncated')
    })
  }
  
  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    })
    app.set('db', db) 
  })

  before('truncate', function(){
    return truncateDB()
  })

  before('seed', function(){
    return seedDB()
  })

  afterEach('truncate', function(){
    return truncateDB()
  })
  
  after('disconnect from db', () => {
    console.log('User Endpoints testing complete')
    db.destroy()
  })

  describe(`POST /api/users/register`, () => {
    it(`creates a new user, responding with 201 and the new user`, () => {

    const newUser = createLoginUser();

    return supertest(app)
      .post('/api/users/register')
      .send(newUser)
      .expect(201)
      .expect(res => {
        expect(res.body.first_name).to.eql(newUser.first_name)
        expect(res.body.last_name).to.eql(newUser.last_name)
        expect(res.body.user_name).to.eql(newUser.user_name)
        expect(res.body).to.have.property('password')

        let hash = res.body.password
        bcrypt.compare(newUser.password, hash)
          .then(result => {
            expect(result).to.be.true;
          });
      })
    })
  })

  describe(`POST /api/users/login`, () => {
    it(`successfully logs in the registered user and creates a JWT for their session`, () => {
      
      const loginUser = createLoginUser();
      
      return supertest(app)
        .post('/api/users/register')
        .send(loginUser)
        .then(res => {
          let currentUser = {
            user_name: res.body.user_name,
            password: 'Abc1234!' //need to send unhashed pw to login endpoint
          }
          return supertest(app)
            .post('/api/users/login')
            .send(currentUser)
            .expect(202)
            .expect(res => {
              expect(res.body).to.have.property('token')
            })
        })
    })
  })

  describe(`GET /api/users/validate`, () => {
    it(`successfully verifies a user's session token`, () => {

      const loginUser = createLoginUser();

      return supertest(app)
        .post('/api/users/register')
        .send(loginUser)
        .then(res => {
          let currentUser = {
            user_name: res.body.user_name,
            password: 'Abc1234!' //need to send unhashed pw to login endpoint
          }
          return supertest(app)
            .post('/api/users/login')
            .send(currentUser)
            .then(res => {
              let token = res.body.token
              return supertest(app)
                .get(`/api/users/validate`)
                .set('session_token', token)
                .expect(200)
                .expect(res => {
                  expect(res.body.message).to.eql('Successful Authentication')
                })
            })
        })
    })   
  })

  describe(`POST /api/user/courses`, () => {
    it(`successfully adds a course to a user's personal course list`, () => {
      
      const loginUser = createLoginUser();
      const courseObject = createCourseObject();

      return supertest(app)
        .post('/api/users/register')
        .send(loginUser)
        .then(res => {
          let currentUser = {
            user_name: res.body.user_name,
            password: 'Abc1234!' //need to send unhashed pw to login endpoint
        }
        return supertest(app)
          .post('/api/users/login')
          .send(currentUser)
          .then(res => {
            let token = res.body.token
            return supertest(app)
              .post('/api/user/courses')
              .set('session_token', token)
              .send(courseObject)
              .expect(201)
              .expect(res => {
                expect(res.body).to.have.property('course_id')
                expect(res.body).to.have.property('user_name')
                expect(res.body).to.have.property('schedule_type')
              })
          })
      })
    })
  })

  describe(`GET /api/user/courses`, () => {
    context(`Given no userCourses`, () => {
      it(`responds with 200 and an empty array`, () => {

        const loginUser = createLoginUser();
      
        return supertest(app)
          .post('/api/users/register')
          .send(loginUser)
          .then(res => {
            let currentUser = {
              user_name: res.body.user_name,
              password: 'Abc1234!' //need to send unhashed pw to login endpoint
            }
            return supertest(app)
              .post('/api/users/login')
              .send(currentUser)
              .then(res => {
                let token = res.body.token
                return supertest(app)
                  .get('/api/user/courses')
                  .set('session_token', token)
                  .expect(200, [])
              })
          })
      })
    })
    
    context(`Given userCourses`, () => {
    
      it(`successfully returns list of courses a user has added to their personal course list`, () => {
        
        const loginUser = createLoginUser();
        const courseObject = createCourseObject();
       
        return supertest(app)
          .post('/api/users/register')
          .send(loginUser)
          .then(res => {
            let currentUser = {
              user_name: res.body.user_name,
              password: 'Abc1234!' //need to send unhashed pw to login endpoint
            }
            return supertest(app)
              .post('/api/users/login')
              .send(currentUser)
              .then(res => {
                let token = res.body.token
                return supertest(app)
                  .post('/api/user/courses')
                  .set('session_token', token)
                  .send(courseObject)
                  .then(res => {
                    return supertest(app)
                      .get(`/api/user/courses`)
                      .set('session_token', token)
                      .expect(200)
                      .expect(res => {
                        expect(res.body).to.be.an('array')
                        expect(res.body.length == 1)

                        for(let i = 0; i < res.body.length; i++){
                          let bootcampObject = res.body[i]
                          expect(bootcampObject).to.have.property('Bootcamp')
                          expect(bootcampObject).to.have.property('Course')
                          expect(bootcampObject).to.have.property('CourseId')
                        }
                      })
                  })
              })
          })
      })
    })
  })

  describe(`GET /api/user/course/:course_id`, () => {
    it(`successfully retrieves the selected course to the user`, () => {

      const loginUser = createLoginUser();
      const courseObject = createCourseObject();
      
      return supertest(app)
        .post('/api/users/register')
        .send(loginUser)
        .then(res => {
          let currentUser = {
            user_name: res.body.user_name,
            password: 'Abc1234!' //need to send unhashed pw to login endpoint
          }
          return supertest(app)
            .post('/api/users/login')
            .send(currentUser)
            .then(res => {
              let token = res.body.token
              return supertest(app)
                .post('/api/user/courses')
                .set('session_token', token)
                .send(courseObject)
                .then(res => {
                  return supertest(app)
                    .get(`/api/user/course/${res.body.course_id}`)
                    .set('session_token', token)
                    .expect(res => {
                      //Course
                      expect(res.body).to.have.property('Course')
                      expect(res.body.Course).to.have.property('id')
                      expect(res.body.Course).to.have.property('name')
                      expect(res.body.Course).to.have.property('is_online')
                      expect(res.body.Course).to.have.property('solo_instruction')
                      expect(res.body.Course).to.have.property('pair_programming')
                      expect(res.body.Course).to.have.property('prior_experience')
                      //PaymentSummary
                      expect(res.body).to.have.property('PaymentSummary')
                      expect(res.body.PaymentSummary).to.have.property('up_front')
                      expect(res.body.PaymentSummary).to.have.property('financing')
                      expect(res.body.PaymentSummary).to.have.property('isa')
                      expect(res.body.PaymentSummary).to.have.property('placement_based')
                      expect(res.body.PaymentSummary).to.have.property('repayment_guarantee')
                      //Languages
                      expect(res.body).to.have.property('Languages')
                      expect(res.body.Languages).to.be.an('array')
                    })
                })
            })
        })
    })
  })

  describe(`DELETE /api/user/course/:course_id`, () => {
    it(`successfully deletes the course from a user's personal course list`, () => {

      const loginUser = createLoginUser();
      const courseObject = createCourseObject();

      return supertest(app)
        .post('/api/users/register')
        .send(loginUser)
        .then(res => {
          let currentUser = {
            user_name: res.body.user_name,
            password: 'Abc1234!' //need to send unhashed pw to login endpoint
          }
          return supertest(app)
            .post('/api/users/login')
            .send(currentUser)
            .then(res => {
              let token = res.body.token
              return supertest(app)
                .post('/api/user/courses')
                .set('session_token', token)
                .send(courseObject)
                .then(res => {
                  return supertest(app)
                    .delete(`/api/user/course/${res.body.course_id}`)
                    .set('session_token', token)
                    .expect(204)
                })
            })
        })
    })
  })
})

