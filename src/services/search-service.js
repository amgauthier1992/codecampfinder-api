const BootcampService = require('./bootcamp-service');
const CourseService = require('./course-service');

module.exports = {  //building a promise and returning results
  getResults(knex, searchRequest){
    
    let getBootcampsAndCourses = BootcampService.getBootcampsAndCourses(knex, searchRequest.is_online, searchRequest.prior_experience);
    let getBootcampLocations = BootcampService.getBootcampsAndLocations(knex, searchRequest.stateCode);
    let getCoursesAndSchedules = CourseService.getCoursesAndSchedules(knex, searchRequest.schedule);
    let getCoursesAndPaymentSummaries = CourseService.getCoursesAndPaymentSummaries(knex, searchRequest.fin_assist);
    let getCoursesAndLanguages = CourseService.getCoursesAndLanguages(knex);

    return Promise.all([ getBootcampsAndCourses, getBootcampLocations, getCoursesAndSchedules, getCoursesAndPaymentSummaries, getCoursesAndLanguages]) //give me all this data for courses/locations, then return it as json
    .then(([ bootcampsAndCourses , locations, schedules, payment_summaries, languages ]) => {
        let bootcamps = []

        for (let i = 0; i < bootcampsAndCourses.length; i++){
          let bootcampRow = bootcampsAndCourses[i];
          
          //using .find() on locations to return 1st object where name (x.Bootcamp) 
          //matches the bootcampRow (data[i].Name)
          let bootcampLocations = locations.find(location => location.BootcampId == bootcampRow.BootcampId);
          
          //for each bootcamp, build up our per-bootcamp object. Thiws is the structure of whats going out the door for this method.
          let bootcamp = {
            Name: bootcampRow.Name,
            Website: bootcampRow.Website,
            Locations: [],
            Courses: []
          }

          if (bootcampLocations){
            bootcamp.Locations = bootcampLocations.Locations;
          } else {
            continue;
          }

          for (let j = 0; j < bootcampRow.Courses.length; j++){
            let courseRow = bootcampRow.Courses[j]
            let courseSchedule = schedules.find(schedule => schedule.CourseId == courseRow.CourseId)
            let coursePaymentSummary = payment_summaries.find(summary => summary.CourseId == courseRow.CourseId)
            let courseLanguages = languages.find(language => language.CourseId == courseRow.CourseId)

            let course = {
              Name: courseRow.Name,
              Is_online: courseRow.Is_online,
              Solo_instruction: courseRow.Solo_instruction,
              Pair_programming: courseRow.Pair_programming,
              Prior_experience: courseRow.Prior_experience,
              Schedule: {},
              PaymentSummary: {},
              Languages: []
            }

            //if I have a schedule, I will add it to the schedule object
            if(courseSchedule){
              course.Schedule = courseSchedule.Schedule;
            } else { //skip this course
              continue;
            }

            //if I have a payment summary, I will add it to the payment_summary object
            if(coursePaymentSummary){
              course.PaymentSummary = coursePaymentSummary.PaymentSummary;
            } else {
              continue;
            }

            //if I have languages, I will add it to the languages array
            if(courseLanguages){
              courseLanguages.Languages.forEach(la =>
                course.Languages.push(la)
              )
            } else {
              continue;
            }

            bootcamp.Courses.push(course)
          }

          //if we have no courses, skip over the bootcamp entirely
          if(bootcamp.Courses.length == 0){
            continue;
          }

          //add our bootcamps results to the array
          bootcamps.push(bootcamp);
        }
        
        return bootcamps
    })
  }
}
