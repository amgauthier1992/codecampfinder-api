const CourseRepo = require('../repositories/courses-repository');
const UsersRepo = require('../repositories/users-repository');

module.exports = {
  getCoursesAndSchedules(knex, schedule){
    let promise = new Promise((resolve, reject) => {
      CourseRepo.getCoursesBySchedule(knex, schedule) 
        .then((data) => {
          let results = [] 

          if (data === null) {
            return results;
          }

          for (let i = 0; i < data.length; i++){
            let row = data[i];

            results.push({  
              CourseId: row.Course_id,
              Name: row.Course,
              Schedule: {
                Type: row.schedule,
                Hours: row.hours,
                Duration: row.duration
              }
            })
          }

          resolve(results)
        })
        .catch(err => {
          console.error(err)
          reject(err)
        })
    })

    return promise;
  },

  getCoursesAndPaymentSummaries(knex, fin_assist){
    let promise = new Promise((resolve, reject) => {
      CourseRepo.getCoursesByPaymentSummary(knex, fin_assist) 
        .then((data) => {
          let results = [] 

          if (data === null) {
            return results;
          }

          for (let i = 0; i < data.length; i++){
            let row = data[i];

            results.push({  
              CourseId: row.Course_id,
              Name: row.Course,
              PaymentSummary: {
                Up_front: row.up_front,
                Financing: row.financing,
                Isa: row.isa,
                Placement_based: row.placement_based,
                Repayment_guarantee: row.repayment_guarantee
              }
            })
          }

          resolve(results)
        })
        .catch(err => {
          console.error(err)
          reject(err)
        })
    }) 

    return promise;     
  },

  getCoursesAndLanguages(knex){
    let promise = new Promise((resolve, reject) => {
      CourseRepo.getCoursesAndLanguages(knex)
        .then((data) => {
          let results = []
          
          if (data === null) {
            return results;
          }

          for (let i = 0; i < data.length; i++){
            let row = data[i];
            let newCourse = false;

            //find returns first match 
            let course = results.find(course => course.CourseId == row.Course_id)

            //if null, then new course
            if (course == null){
              newCourse = true;
              course = {
                CourseId: row.Course_id,
                Name: row.Course,
                Languages: []
              }
            }

            //add language
            course.Languages.push(row.language)
              
            if(newCourse){
              results.push(course)
            }
          }
          
          resolve(results)
        })
        .catch(err => {
          console.error(err)
          reject(err)
        })
    })

    return promise;
  },

  getCourseInformation(knex, course_id){

    const getUserCourseById = CourseRepo.getCourseById(knex, course_id)
    const getUserCourseBySchedule = UsersRepo.getUserCourseSchedule(knex, course_id)
    const getUserCoursePaymentSummary = UsersRepo.getUserCoursePaymentSummary(knex, course_id)
    const getUserCourseLanguages = UsersRepo.getUserCourseLanguages(knex, course_id)

    return Promise.all([getUserCourseById, getUserCourseBySchedule, getUserCoursePaymentSummary, getUserCourseLanguages])
      .then(([ course, schedule, paymentSummary, languages ]) => {
    
        return {
          Course: course,
          Schedule: schedule,
          PaymentSummary: paymentSummary,
          Languages: languages.map(la => la.language)
        }
      })
  }
}
