require('dotenv').config();
const knex = require('knex');
const app = require('../src/app');
const { createLoginUser } = require('./users.fixtures');

describe(`Search Endpoint`, function() {

  let db;

  const truncateDB = () => {
    return db.raw(
      `TRUNCATE
        course_languages,
        languages,
        payment_summaries,
        course_schedules,
        user_courses,
        bootcamp_courses,
        courses,
        bootcamp_locations,
        locations, 
        bootcamps,
        users
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
    console.log('Search Endpoint testing complete')
    db.destroy()
  })

  describe(`POST /api/search`, () => {
    it(`responds with bootcamp data based on the user's search criteria`, () => {

      const loginUser = createLoginUser();
      const searchParams = {
        stateCode: 'IL',
        is_online: 'true',
        prior_experience: 'false',
        schedule: 'full_time',
        fin_assist: true
      }

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
                .post('/api/search')
                .set('session_token', token)
                .send(searchParams)
                .then(res => {
                  expect(res.body).to.be.an('array')
                  for(let i = 0; i < res.body.length; i++){
                    let Bootcamp = res.body[i]
                    expect(Bootcamp).to.have.property('Name')
                    expect(Bootcamp).to.have.property('Website')
                    //Locations
                    expect(Bootcamp).to.have.property('Locations')
                    expect(Bootcamp.Locations).to.be.an('array')
                    for(let j = 0; j < Bootcamp.Locations.length; j++){
                      let Location = Bootcamp.Locations[j]
                      expect(Location).to.have.property('city')
                      expect(Location).to.have.property('state')
                    }
                    //Courses
                    expect(Bootcamp.Courses).to.be.an('array')
                    for(let k = 0; k < Bootcamp.Courses.length; k++){
                      let Course = Bootcamp.Courses[k]
                      expect(Course).to.have.property('Name')
                      expect(Course).to.have.property('Is_online')
                      expect(Course).to.have.property('Solo_instruction')
                      expect(Course).to.have.property('Pair_programming')
                      expect(Course).to.have.property('Prior_experience')
                      //Schedule
                      expect(Course).to.have.property('Schedule')
                      expect(Course.Schedule).to.have.property('Type')
                      expect(Course.Schedule).to.have.property('Hours')
                      expect(Course.Schedule).to.have.property('Duration')
                      //Payment Summary
                      expect(Course).to.have.property('PaymentSummary')
                      expect(Course.PaymentSummary).to.have.property('Up_front')
                      expect(Course.PaymentSummary).to.have.property('Financing')
                      expect(Course.PaymentSummary).to.have.property('Isa')
                      expect(Course.PaymentSummary).to.have.property('Placement_based')
                      expect(Course.PaymentSummary).to.have.property('Repayment_guarantee')
                      //Languages
                      expect(Course).to.have.property('Languages')
                      expect(Course.Languages).to.be.an('array')
                    }
                  }
                })
            })
        })
    })
  })
})
